<%@page import="imod.Help" %>
<%@page import="imod.Imod" %>
<%@page import="imod.ImodUser" %>

<!DOCTYPE html>
<html>
    <head>
        <title>
            Print Instructional Plan
        </title>
        <g:external dir="css/source" file="instructionalPlan.css" media="screen, print"/>
        <g:external dir="bower_components/jquery/dist" file="jquery.min.js" />
        <g:external dir="bower_components/jquery.ui/ui" file="core.js" />
        <g:external dir="bower_components/jquery.ui/ui" file="widget.js" />

        <!-- plugins to javascript libraries-->
        <g:javascript src="source/syllabus.js" defer="defer" />

    </head>
    <body>
        <div class="wrapper">

        	<div class="float-wrapper">
	        	<div class="right">
	            	<button class="topicButtonGradient printpdf">Print Page</button>
	            </div>
            </div>

            <h2>
                <center>Instructional Plan</center>
            </h2>

            <div id="instruction-plan-accordion">
                <g:if test="${learningObjectives}">
                    <g:each var="learningObjective" in="${learningObjectives}" status="index">
                            <h3 class="istructional-plan-LO" id="${learningObjective.id}">${ learningObjective.definition }</h3>
                            <div class="assignedTechniques" id="assignedTechniques-${learningObjective.id}">
                            <g:if test="${arrayOfLOPedagogyTechniques[index]}">
                                <ul>
                                <g:each var="technique" in="${arrayOfLOPedagogyTechniques[index]}">
                                    <li> ${technique}</li>
                                </g:each>
                                </ul>
                            </g:if>
                            <g:else>
                                No techniques are assigned to this Learning Objective
                            </g:else>
                            </div>
                    </g:each>
                </g:if>
                <g:else>
                    <div class="no-objective-defined">
                        There are no objectives defined
                    </div>
                </g:else>
            </div>
	        <div class="right">
            	<button class="topicButtonGradient printpdf">Print Page</button>
            </div>

            <input type="hidden" id="sortIdList" value="${sortIdList}">
        </div>
    </body>
</html>
