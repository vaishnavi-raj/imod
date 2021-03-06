package imod

import grails.converters.JSON

class AssessmentController {
	def learningObjectiveService
	def springSecurityService

	static allowedMethods = [
		index: 'GET',
		findMatchingTechniques: 'POST'
	]

	/**
	 * index called when Assessment tab loads
	 * @param id
	 */
	def index(Long id, Long learningObjectiveID) {

		// get the selected imod
		final currentImod = Imod.get(id)

		// finds all the learning objective linked to this imod
		final learningObjectives = learningObjectiveService.getAllByImod(currentImod)

		// If no learning objective is selected
		// select the first one if it exists
		if (params.learningObjectiveID == null && learningObjectives.size > 0) {
			redirect(
  				controller: 'assessment',
  				action: 'index',
  				id:  id,
  				params: [learningObjectiveID: learningObjectives[0].id]
  			)
		}

		// select current learning objective
		final currentLearningObjective = learningObjectiveService.safeGet(currentImod, learningObjectiveID)

		// get all of the filters used to find Assessment techniques
		final domainCategories = DomainCategory.list()
		final knowledgeDimensions = KnowledgeDimension.list()
		final learningDomains = LearningDomain.list()
		final assessmentFeedback = AssessmentFeedback.list()
		final selectedActionWordCategory = currentLearningObjective?.actionWordCategory
		final selectedDomainCategory = selectedActionWordCategory?.domainCategory
		final selectedDomain = selectedDomainCategory?.learningDomain
		final content = currentLearningObjective.contents
		def knowDimensionList = []
		def dimension = []
		if (content != null) {
			content.each {
				knowDimensionList.push(it.dimensions)
			}
			// merge multiple lists into one
			dimension = knowDimensionList.flatten()
			// remove duplicates
			dimension = dimension.unique { a, b ->
				a <=> b
			}
		}

		def dimensionSize = 0
		if (dimension != null) {
			dimensionSize  = dimension.size() - 1
		}

		[
			currentImod: currentImod,
			currentLearningObjective: currentLearningObjective,
			currentPage: 'assessment',
			domainCategories: domainCategories,
			knowledgeDimensions: knowledgeDimensions,
			learningDomains: learningDomains,
			learningObjectives: learningObjectives,
			assessmentFeedback: assessmentFeedback,
			selectedDomain: selectedDomain,
			selectedDomainCategory: selectedDomainCategory,
			dimension: dimension,
			dimensionSize: dimensionSize
		]
	}

	def getAssessmentPlan(long id) {
		// get the selected imod
		final currentImod = Imod.get(id)

		// finds all the learning objective linked to this imod
		final learningObjectives = learningObjectiveService.getAllByImod(currentImod)

		def list = []

		learningObjectives.each { it ->
			def obj = [:]
			obj['text'] = it.definition
			obj['id'] = it.id
			obj['techs'] = []

			it.assessmentTechniques.each { p ->
				obj['techs'].add(p.title)
			}
			list.add(obj)
		}

		render (
			[
				techniques: list
			] as JSON
		)
	}

	/**
	 * Finds ideal and extended matches based on learning domains and knowledge dimensions
	 * expects params
	 * - knowledgeDimesions: name of each selected dimension
	 * - domain category: name of each selected category
	 * - learning domain: name of each selected domain
	 */
	def findMatchingTechniques() {
		final data = request.JSON

		// process strings to longs
		def selectedKnowledgeDimensions = []
		def selectedDomainCategories = []
		def selectedLearningDomains = []
		def allLearningDomains = []

		for (def knowledgeDimension in data.selectedKnowledgeDimensions) {
			selectedKnowledgeDimensions.add(knowledgeDimension.toLong())
		}

		for (def domainCategory in data.selectedDomainCategories) {
			selectedDomainCategories.add(domainCategory.toLong())
		}

		for (def learningDomain in data.selectedLearningDomains) {
			selectedLearningDomains.add(learningDomain.toLong())
		}

		LearningDomain.list().each {
			allLearningDomains.add(it.id)
		}

		def currentUser = ImodUser.findById(springSecurityService.currentUser.id)

		def idealAssessmentTechniqueMatch

		if (selectedKnowledgeDimensions.size() && selectedDomainCategories.size() && selectedLearningDomains.size()) {
			// find all technique where both the knowledge dimension and the domain category match
			idealAssessmentTechniqueMatch = AssessmentTechnique.withCriteria {
				and {
					or {
						eq('isAdmin', true)
						users {
							eq('id', currentUser.id)
						}
					}
					knowledgeDimension {
						'in' ('id', selectedKnowledgeDimensions)
					}
					domainCategory {
						'in' ('id', selectedDomainCategories)
					}
					learningDomain {
						'in' ('id', selectedLearningDomains)
					}
				}
				resultTransformer org.hibernate.Criteria.DISTINCT_ROOT_ENTITY
			}
		} else {
			idealAssessmentTechniqueMatch = []
		}

		def extendedAssessmentTechniqueMatch

		if (selectedLearningDomains.size()) {
			// find all technique that are not ideal, but have the learning domain
			extendedAssessmentTechniqueMatch = AssessmentTechnique.withCriteria {
				and {
					or {
						eq('isAdmin', true)
						users {
							eq('id', currentUser.id)
						}
					}
					learningDomain {
						'in' ('id', selectedLearningDomains)
					}

				}
				resultTransformer org.hibernate.Criteria.DISTINCT_ROOT_ENTITY
			}
		} else {
			extendedAssessmentTechniqueMatch = []
		}

		extendedAssessmentTechniqueMatch = (idealAssessmentTechniqueMatch + extendedAssessmentTechniqueMatch) - extendedAssessmentTechniqueMatch.intersect(idealAssessmentTechniqueMatch)

		def userAssessmentTechniqueMatch = AssessmentTechnique.withCriteria {
			and {
					users {
						eq('id', currentUser.id)
					}
				learningDomain {
					'in' ('id', allLearningDomains)
				}

			}
			resultTransformer org.hibernate.Criteria.DISTINCT_ROOT_ENTITY
		}
		final favoriteTechniques = currentUser.favoriteAssessmentTechnique.id
		def stringfavoriteTechniques = []
		//Convert int to string
		for (def favoriteTechnique in favoriteTechniques) {
			stringfavoriteTechniques.add(favoriteTechnique.toString())
		}

		def currentLearningObjective = LearningObjective.findById(data.learningObjectiveID.toLong())
		final LOAssessmentTechniques = currentLearningObjective.assessmentTechniques.id
		def stringLOAssessmentTechniques = []
		//Convert int to string
		for (def LOAssessmentTechnique in LOAssessmentTechniques) {
			stringLOAssessmentTechniques.add(LOAssessmentTechnique.toString())
		}
		idealAssessmentTechniqueMatch.sort {
			it.title.toUpperCase()
		}
		extendedAssessmentTechniqueMatch.sort {
			it.title.toUpperCase()
		}

		render(
			[
				idealAssessmentTechniqueMatch: idealAssessmentTechniqueMatch,
				extendedAssessmentTechniqueMatch: extendedAssessmentTechniqueMatch,
				userTechniques: userAssessmentTechniqueMatch,
				favoriteTechniques: stringfavoriteTechniques,
				LOAssessmentTechniques: stringLOAssessmentTechniques
			] as JSON
		)
	}

	/*print assessment plan*/
	def assessmentPlan(Long id) {
		final currentImod = Imod.get(id)
		final learningObjectives = LearningObjective.findAllByImod(currentImod)
		[
			learningObjectives: learningObjectives
		]
	}
	def handler (Exception e) {
		print (e)
		def idealAssessmentTechniqueMatch = []
		final data = request.JSON
		def selectedLearningDomains = []
		def allLearningDomains =[(94).toLong(), (95).toLong(), (96).toLong()]

		for (def learningDomain in data.selectedLearningDomains) {
			selectedLearningDomains.add(learningDomain.toLong())
		}

		def currentUser = ImodUser.findById(springSecurityService.currentUser.id)
		// find all technique that are not ideal, but have the learning domain
		def extendedAssessmentTechniqueMatch = AssessmentTechnique.withCriteria {
			and {
				or {
					eq('isAdmin', true)
					users {
						eq('id', currentUser.id)
					}
				}
				learningDomain {
					'in' ('id', selectedLearningDomains)
				}

			}
			resultTransformer org.hibernate.Criteria.DISTINCT_ROOT_ENTITY
		}
		extendedAssessmentTechniqueMatch = (idealAssessmentTechniqueMatch + extendedAssessmentTechniqueMatch) - extendedAssessmentTechniqueMatch.intersect(idealAssessmentTechniqueMatch)

		def userAssessmentTechniqueMatch = AssessmentTechnique.withCriteria {
			and {
					users {
						eq('id', currentUser.id)
					}
				learningDomain {
					'in' ('id', allLearningDomains)
				}

			}
			resultTransformer org.hibernate.Criteria.DISTINCT_ROOT_ENTITY
		}
		final favoriteTechniques = currentUser.favoriteAssessmentTechnique.id
		def stringfavoriteTechniques = []
		//Convert int to string
		for (def favoriteTechnique in favoriteTechniques) {
			stringfavoriteTechniques.add(favoriteTechnique.toString())
		}

		def currentLearningObjective = LearningObjective.findById(data.learningObjectiveID.toLong())
		final LOAssessmentTechniques = currentLearningObjective.assessmentTechniques.id
		def stringLOAssessmentTechniques = []
		//Convert int to string
		for (def LOAssessmentTechnique in LOAssessmentTechniques) {
			stringLOAssessmentTechniques.add(LOAssessmentTechnique.toString())
		}
		extendedAssessmentTechniqueMatch.sort {
			it.title.toUpperCase()
		}

		render(
			[
				idealAssessmentTechniqueMatch: idealAssessmentTechniqueMatch,
				extendedAssessmentTechniqueMatch: extendedAssessmentTechniqueMatch,
				userTechniques: userAssessmentTechniqueMatch,
				favoriteTechniques: stringfavoriteTechniques,
				LOAssessmentTechniques: stringLOAssessmentTechniques
			] as JSON
		)
	}
}
