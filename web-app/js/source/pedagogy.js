var baseUrl = window.location.pathname.match(/\/[^\/]+\//)[0];

/**
 * Opens the modal to create a new pedagogy technique
 */
function openNewPedagogyTechniqueModal () {
	'use strict';
	$('#techniqueId').val('');
	$('#add-new-technique').css('display', 'block');
	$('#topicDialogBackground').css('display', 'block');
}

function repopulateCheckboxes () {
	'use strict';
	var checkboxValues = $.cookie('checkboxValues');

	if (checkboxValues) {
		Object.keys(checkboxValues).forEach(function (element) {
			var checked = checkboxValues[element];

			$('#' + element).prop('checked', checked);
		});
	}
}
function openInstructionalPlanModal () {
	'use strict';
	$('#instruction-plan').css('display', 'block');
	$('#topicDialogBackground').css('display', 'block');
}

function populateInstructionalPlanTechniques () {
	'use strict';
	var data;
	var index;
	var assignedTechniques = '';

	// Bundle the data into an object
	data = {
		learningObjectiveID: $(this).attr('id')
	};

	// Send the data to the find matching techniques action in grails
	// and process the response with the display pedagogy techniques callback
	$.ajax({
		url: '../findAssignedTechniques',
		method: 'post',
		data: JSON.stringify(data),
		contentType: 'application/json'
	}).done(function (data) {
		if (data.LOPedagogyTechniques.length > 0) {
			for (index = 0; index < data.LOPedagogyTechniques.length; index++) {
				assignedTechniques += '<li>' + data.LOPedagogyTechniques[index] + '</li>';
			}
			$('#assignedTechniques-' + data.currentLearningObjective).html('<ul>' + assignedTechniques + '</ul>');
		} else {
			$('#assignedTechniques-' + data.currentLearningObjective).html('No techniques are assigned to this Learning Objective');
		}
	});
}
function closeDimModal () {
	'use strict';
	var checked = '';
	var dialog = $('#selectKnowledgeDimensions');
	var background = $('#selectKnowledgeDimensionBackground');

	$('#selectKnowledgeDimensions input[type=checkbox]').each(function () {
		if ($(this).is(':checked')) {
			checked = checked + ($(this).val()) + ',';
		}
	});
	document.getElementById('knowledgeDimension').value = checked;
	dialog.css('display', 'none');
	background.css('display', 'none');
}
function changePic () {
	'use strict';
	var iconName = '';

	$('#selectKnowledgeDimensions').find('input:checkbox').each(
		function () {
			if ($(this).prop('checked')) {
				iconName += $(this).val().charAt(0);
			}
		}
	);
	if (iconName === '') {
		iconName = $('#imgNone').attr('href');
	} else {
		iconName = $('#img' + iconName).attr('href');
	}
	$('#dimImage').attr('src', iconName);
}
function openDimModal () {
	'use strict';
	var dimString = $('#knowDimensionList').val();
	var dimensionList = [];
	var dialog = $('#selectKnowledgeDimensions');
	var background = $('#selectKnowledgeDimensionBackground');
	var index;
	var findCheckBox;

	if (dimString !== '' && dimString !== null && typeof dimString !== 'undefined') {
		dimensionList = dimString.split(',');
	}
	for (index = 0; index < dimensionList.length; index++) {
		findCheckBox = $(dialog).find('#' + dimensionList[index]);
		if (findCheckBox.length === 1) {
			findCheckBox.prop('checked', true);
		}
	}
	changePic();
	dialog.css('display', 'inherit');
	background.css('display', 'block');
	return false;
}
function populatePedagogyTechnique (data) {
	'use strict';
	var currentTechnique = data.pedagogyTechnique;
	var count;
	var arrayOfKnowledgeDimensions = data.knowledgeDimension.split(',');

	$('#editTitle').html('<b>Edit Pedagogy Technique</b>');
	// Set the text fields
	// Decided to remove location and strategy description fields.
	$('#title').val(currentTechnique.title);
	// $('#location').val(currentTechnique.location);
	$('#duration').val(currentTechnique.direction);
	$('#materials').val(currentTechnique.materials);
	$('#reference').val(currentTechnique.reference);
	// $('#strategyDescription').val(currentTechnique.strategyDescription);
	$('#activityDescription').val(currentTechnique.activityDescription);
	for (count = 0; count < arrayOfKnowledgeDimensions.length; count++) {
		if (arrayOfKnowledgeDimensions[count] !== '') {
			$('#' + arrayOfKnowledgeDimensions[count]).prop('checked', true);
		}
	}
	// Choose correct item from selectables
	$('#learning-domain option[value=' + data.learningDomain + ']').prop('selected', true);
	populateDomainCategories(function () {
		$('#domain-category option[value=' + data.domainCategory + ']').prop('selected', true);
	});
}
function displayPedagogyInformationInEdit () {
	'use strict';
	var res = '';

	var str = $('label.ui-state-hover').attr('for');
	var indexNo = str.indexOf('Extended');

	if (indexNo > -1) {
		res = str.substring(0, indexNo);
	} else {
		res = $('label.ui-state-hover').attr('for');
	}

	$('#techniqueId').val(res);
	$.ajax({
		url: '../../pedagogyTechnique/get/' + res,
		method: 'GET'
	})
	.done(populatePedagogyTechnique);
}

/**
 * Callback for find matching techniques grails action
 * this takes the json data and processes it into html code
 */
function displayPedagogyTechniques (data) {
	'use strict';
	var idealText = '';
	var index;
	var currentTechnique;
	var extendedText = '';
	var favoriteImgToggle = '';
	var assignImgToggle = '';

	// Take the titles and make html code to display
	for (index = 0; index < data.idealPedagogyTechniqueMatch.length; index++) {
		currentTechnique = data.idealPedagogyTechniqueMatch[index];
		if (data.favoriteTechniques.indexOf(currentTechnique.id.toString()) > -1) {
			favoriteImgToggle = '../../images/fav.png';
		} else {
			favoriteImgToggle = '../../images/unfav.png';
		}

		if (data.LOPedagogyTechniques.indexOf(currentTechnique.id.toString()) > -1) {
			assignImgToggle = '../../images/assign.png';
		} else {
			assignImgToggle = '../../images/unassign.png';
		}

		idealText += '<input type="radio" id="' + currentTechnique.id + '" name="pedagogyTechnique" value="' + currentTechnique.id + '">';
		idealText += '<label class="pedagogy-block" for="' + currentTechnique.id + '"><div class="favorite" id="topLeft"><img src="' + favoriteImgToggle + '"/>' +
					'</div><div class="assign" id="topRight"><img src="' + assignImgToggle + '" /></div><div title="' + currentTechnique.title + '" class="text-block title" id="titleDiv"><span>' + truncateString(currentTechnique.title, 100) + '</span></div></label>';
	}

	// Take the titles and make html code to display
	for (index = 0; index < data.extendedPedagogyTechniqueMatch.length; index++) {
		currentTechnique = data.extendedPedagogyTechniqueMatch[index];
		if (data.favoriteTechniques.indexOf(currentTechnique.id.toString()) > -1) {
			favoriteImgToggle = '../../images/fav.png';
		} else {
			favoriteImgToggle = '../../images/unfav.png';
		}

		if (data.LOPedagogyTechniques.indexOf(currentTechnique.id.toString()) > -1) {
			assignImgToggle = '../../images/assign.png';
		} else {
			assignImgToggle = '../../images/unassign.png';
		}
		extendedText += '<input type="radio" id="' + currentTechnique.id + 'Extended" name="pedagogyTechniqueExtended" value="' + currentTechnique.id + '">';
		extendedText += '<label class="pedagogy-block" for="' + currentTechnique.id + 'Extended"><div id="topLeft"><img src="' + favoriteImgToggle + '"/>' +
					'</div><div id="topRight"><img src="' + assignImgToggle + '" /></div><div title="' + currentTechnique.title + '" id="titleDiv" class="text-block"><span>' +
					truncateString(currentTechnique.title, 100) + '</span></div></label>';
	}

	// Add html code to the page
	$('#ideal-matches').html(idealText);
	$('#extended-matches').html(extendedText);

	$('#ideal-matches').buttonset();

	$('#topLeft img').click(function () {
		var str = '';
		var indexNo = '';
		var res = '';

		if ($(this).attr('src') === '../../images/fav.png') {
			$(this).attr('src', '../../images/unfav.png');
			str = $('label.ui-state-hover').attr('for');
			indexNo = str.indexOf('Extended');
			if (indexNo > -1) {
				res = str.substring(0, indexNo);
			} else {
				res = str;
			}
			$.ajax({
				url: '../../pedagogyTechnique/unassignFavorite/' + res,
				method: 'GET',
				success: function () {}

			});
		} else {
			$(this).attr('src', '../../images/fav.png');
			str = $('label.ui-state-hover').attr('for');
			indexNo = str.indexOf('Extended');
			if (indexNo > -1) {
				res = str.substring(0, indexNo);
			} else {
				res = str;
			}
			$.ajax({
				url: '../../pedagogyTechnique/assignFavorite/' + res,
				method: 'GET',
				success: function () {}
			});
		}
	});

	$('#topRight img').click(function () {
		var str = '';
		var indexNo = '';
		var res = '';

		if ($(this).attr('src') === '../../images/assign.png') {
			$(this).attr('src', '../../images/unassign.png');
			str = $('label.ui-state-hover').attr('for');
			indexNo = str.indexOf('Extended');
			if (indexNo > -1) {
				res = str.substring(0, indexNo);
			} else {
				res = str;
			}

			data = {
				learningObjectiveID: $('#learningObjectiveID').val(),
				pedagogyTechniqueID: res
			};
			$.ajax({
				url: '../../pedagogyTechnique/unassignToLearningObjective',
				type: 'POST',
				data: JSON.stringify(data),
				contentType: 'application/json',
				success: function () {}
			});
		} else {
			$(this).attr('src', '../../images/assign.png');
			str = $('label.ui-state-hover').attr('for');
			indexNo = str.indexOf('Extended');
			if (indexNo > -1) {
				res = str.substring(0, indexNo);
			} else {
				res = str;
			}

			data = {
				learningObjectiveID: $('#learningObjectiveID').val(),
				pedagogyTechniqueID: res
			};
			$.ajax({
				url: '../../pedagogyTechnique/assignToLearningObjective',
				type: 'POST',
				data: JSON.stringify(data),
				contentType: 'application/json',
				success: function () {}
			});
		}
	});

	$('.title span').click(function () {
		$('#add-new-technique').css('display', 'block');
		$('#topicDialogBackground').css('display', 'block');
		displayPedagogyInformationInEdit();
	});

	$('#extended-matches').buttonset();
}

/**
 * Reads which filters are selected and sends information to server to update
 * visible pedagogy techniques
 */
function filterPedagogyTechniques () {
	'use strict';
	// Get all of the selected checkboxes
	var selectedKnowledgeDimensions = $('input[name=knowledgeDimension]:checked');
	var selectedLearningDomains = $('input[name=learningDomain]:checked');
	var selectedDomainCategories = $('input[name=domainCategory]:checked');
	// Arrays to store the data
	var selectedKnowledgeDimensionsData = [];
	var selectedLearningDomainsData = [];
	var selectedDomainCategoriesData = [];
	var index;
	var data;

	// Get the id of the grails domain from the value attribute in the html
	for (index = 0; index < selectedKnowledgeDimensions.length; index++) {
		selectedKnowledgeDimensionsData[index] = selectedKnowledgeDimensions[index].value;
	}
	for (index = 0; index < selectedLearningDomains.length; index++) {
		selectedLearningDomainsData[index] = selectedLearningDomains[index].value;
	}
	for (index = 0; index < selectedDomainCategories.length; index++) {
		selectedDomainCategoriesData[index] = selectedDomainCategories[index].value;
	}

	// Bundle the data into an object
	data = {
		selectedKnowledgeDimensions: selectedKnowledgeDimensionsData,
		selectedLearningDomains: selectedLearningDomainsData,
		selectedDomainCategories: selectedDomainCategoriesData,
		learningObjectiveID: $('#learningObjectiveID').val()
	};

	// Send the data to the find matching techniques action in grails
	// and process the response with the display pedagogy techniques callback
	$.ajax({
		url: '../findMatchingTechniques',
		method: 'post',
		data: JSON.stringify(data),
		contentType: 'application/json'
	}).done(function (data) {
		displayPedagogyTechniques(data);
		pedagogyEqualHeights('#ideal-matches');
		pedagogyEqualHeights('#extended-matches');
	});
}

function truncateString (string, count) {
	'use strict';
	if (string.length > count) {
		return string.substring(0, count) + '...';
	}

	return string;
}

function pedagogyEqualHeights (parent) {
	'use strict';
	var max = 0;
	var isOpen = false;
	var parentBlock = $(parent);
	var pedagogyBlock = parentBlock.find('.pedagogy-block');

	if (parentBlock.css('display') === 'none') {
		parentBlock.show();
		isOpen = true;
	}

	pedagogyBlock.each(function () {
		var height = $(this).height();

		if (max < height) {
			max = height;
		}
	});
	pedagogyBlock.height(max);
	if (isOpen) {
		parentBlock.hide();
	}
}

function getMinHeight (liArray) {
	'use strict';
	var minHeight = Math.floor(liArray.eq(0).height());

	liArray.each(
		function () {
			var refineText;

			if (Math.floor($(this).height()) < minHeight) {
				minHeight = Math.floor($(this).height());
			}
			refineText = $('a', this).text().replace(/[\s\t]+/g, ' ');
			$('a', this).text(refineText);
		}
	);
	return minHeight;
}

/* Populate the bread crumbs above ideal matches*/
function updateTextArea (checkBoxName) {
	'use strict';
	var allVals = [];
	var valsLength;
	var text = '';
	var right = '';

	$('input[name=' + checkBoxName + ']:checked').each(function () {
		allVals.push($(this).prev().prev().text().trim());
	});
	valsLength = allVals.length;

	switch (checkBoxName) {
		case 'domainCategory':
			text = 'Domain Category';
			right = '&nbsp;&nbsp;<i class="fa fa-caret-right"></i>';
			break;
		case 'learningDomain':
			text = 'Learning Domain';
			right = '&nbsp;&nbsp;<i class="fa fa-caret-right"></i>';
			break;
		case 'knowledgeDimension':
			text = 'Knowledge Dimension';
			right = '';
			break;
	}

	if (allVals.length > 2) {
		$('#' + checkBoxName + 'span').html('<b>' + text + ' (' + valsLength + ' Selections)</b>' + right + '</span>&nbsp;&nbsp;');
	} else {
		$('#' + checkBoxName + 'span').html('<b>' + allVals + '</b>' + right + '</span>&nbsp;&nbsp;');
	}
}

/* callback added to do something when the response of the asyncronous ajax call has arrived*/
function populateDomainCategories (callback) {
	'use strict';
	$.ajax({
		url: baseUrl + 'learningObjective/getDomainCategories',
		type: 'GET',
		dataType: 'json',
		data: {
			domainName: $('#learning-domain').val().trim()
		},
		success: function (data) {
			// Stores the data from the call back
			var categories = data.value;
			// This stores the new html that will be added
			var options = '';
			var index;

			// For each of the categories
			for (index = 0; index < categories.length; index++) {
				// Create the html for the category
				options += '<option value="' + categories[index].name + '">' + categories[index].name + '</option>';
			}
			// Store this to the page
			$('#domain-category').empty().append(options);
			callback();
		}
	});
}

$(document).ready(
	function () {
		'use strict';
		var liArray;
		var height;
		var currHeader;
		var currContent;
		var isPanelSelected;
		var checkBoxName;
		var hasError = false;

		$.cookie.json = true;
		repopulateCheckboxes();

		// Load techniques on page load
		filterPedagogyTechniques();
		// The filters for the pedagogy technique are wrapped in a accordian
		// beforeActivate is to be able to open both ideal & extended matches simultaneously
		$('#filter-pedagogy-techniques').accordion({collapsible: true, heightStyle: 'content'});
		$('#instruction-plan-accordion').accordion({collapsible: true, heightStyle: 'content', active: false});
		$('#ideal-matches-toggle').accordion({collapsible: true,
			beforeActivate: function (event, ui) {
				// The accordion believes a panel is being opened
				if (ui.newHeader[0]) {
					currHeader = ui.newHeader;
					currContent = currHeader.next('.ui-accordion-content');
					// The accordion believes a panel is being closed
				} else {
					currHeader = ui.oldHeader;
					currContent = currHeader.next('.ui-accordion-content');
				}
				// Since we've changed the default behavior, this detects the actual status
				isPanelSelected = currHeader.attr('aria-selected') === 'true';
				// Toggle the panel's header
				currHeader.toggleClass('ui-corner-all', isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top', !isPanelSelected).attr('aria-selected', ((!isPanelSelected).toString()));
				// Toggle the panel's icon
				currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e', isPanelSelected).toggleClass('ui-icon-triangle-1-s', !isPanelSelected);
				// Toggle the panel's content
				currContent.toggleClass('accordion-content-active', !isPanelSelected);
				if (isPanelSelected) {
					currContent.slideUp();
				} else {
					currContent.slideDown();
				}
				// Cancels the default action
				return false;
			}
		});
		$('#k1').click(openDimModal);
		$('#knowDimFinished').click(closeDimModal);
		$('#selectKnowledgeDimensions').on('change', 'input:checkbox', changePic);
		// Attach a listener to the checkboxes, to update the pedaogy techniques
		// when the filters have been changed
		$('input[name=knowledgeDimension]').on('change',
		function () {
			checkBoxName = 'knowledgeDimension';
			updateTextArea(checkBoxName);
			filterPedagogyTechniques();
		});
		$('input[name=learningDomain]').on('change',
		function () {
			checkBoxName = 'learningDomain';
			updateTextArea(checkBoxName);
			filterPedagogyTechniques();
		});
		$('input[name=domainCategory]').on('change',
		function () {
			checkBoxName = 'domainCategory';
			updateTextArea(checkBoxName);
			filterPedagogyTechniques();
		});

		// fetching checkboxes and making a cookie
		$(':checkbox').on('change', function () {
			var checkboxValues = {};

			$(':checkbox').each(function () {
				checkboxValues[this.id] = this.checked;
			});
			$.cookie('checkboxValues', checkboxValues, {expires: 1, path: '/'});
		});

		$('#saveButton').on('click',
		function () {
			if ($('#title').val() === '') {
				$('#errorMessage').text('Technique must have a title!');
				hasError = true;
			} else {
				hasError = false;
			}

			if (hasError === true) {
				return false;
			}
		});

		// When add new technique button is clicked open modal
		$('#add-new-technique-button').on('click', openNewPedagogyTechniqueModal);

		// When instructional plan button is clicked open modal
		$('#instruction-plan-button').on('click', openInstructionalPlanModal);

		$('#instruction-plan-accordion h3').on('click', populateInstructionalPlanTechniques);

		$('#closeInstructionalPlan').on('click',
			function () {
				$('#instruction-plan').css('display', 'none');
				$('#topicDialogBackground').css('display', 'none');
			}
		);

		// When hovered over LO side-tab list, it displays full text as tool-tip
		liArray = $('ul.learning-objective.list-wrapper').children('li');
		height = getMinHeight(liArray);

		liArray.each(
			function () {
				$('a', this).attr('title', $('a', this).text());
				if (Math.floor($(this).height()) !== height) {
					$('a', this).text($('a', this).text().substring(0, 70) + '...');
				}
				if ($(this).hasClass('active')) {
					$('a', this).text($('a', this).attr('title'));
				}
			}
		);

		// Listen for the selected learning domain to change, when it does call ajax
		$('#learning-domain').on(
			'change',
			function () {
				populateDomainCategories(function () {});
			});
	}
);

$(window).ready(function () {
	'use strict';
	pedagogyEqualHeights('#ideal-matches');
	pedagogyEqualHeights('#extended-matches');
});
