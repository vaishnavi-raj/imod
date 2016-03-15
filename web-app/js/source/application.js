var formSubmitted = false;

$(document).ready(function () {
	'use strict';

	$('.tooltipster').tooltipster({
		theme: 'tooltipster-noir',
		position: 'bottom'
	});

	$('#accordion').accordion({
		heightStyle: 'content',
		collapsible: true
	});
	$('#help-placeholder-2').css('display', 'none');
	$('.show-hover-new').qtip({
		style: {
			background: 'transparent',
			border: 'none',
			color: 'black'
		},
		show: 'mouseover',
		hide: 'mouseout',
		position: {
			type: 'static',
			container: $('div#qtip-place')
		}
	});

	$('*').focus(
		function () {
			$('#qtip-place').html(document.activeElement.title);
		}
	);

	$('input[type="submit"]').hover(
		function () {
			$('#qtip-place').html($(this).attr('oldtitle'));
		},
		function () {
			$('#qtip-place').html('');
		}
	);
	$('.topicButton').hover(
		function () {
			$('#qtip-place').html($(this).attr('oldtitle'));
		},
		function () {
			$('#qtip-place').html('');
		}
	);
	$('.knowledgeDimensionButton').hover(
		function () {
			$('#qtip-place').html($(this).attr('oldtitle'));
		},
		function () {
			$('#qtip-place').html('');
		}
	);

	$('input[type="checkbox"], input[type="radio"], .knowledgeDimensionButton,.ResourceButton,.priority').hover(
		function () {
			$('#qtip-place').html($(this).attr('title'));
		},
		function () {
			$('#qtip-place').html('');
		}
	);

	$('.topicModalButton').hover(
		function () {
			$('#help-placeholder').css('height', '15em');
			$('#qtip-place').html($(this).attr('title'));
		},
		function () {
			$('#help-placeholder').css('height', '10em');
			$('#qtip-place').html('');
		}
	);
	// Make modals draggable
	$('.draggable').draggabilly({
		handle: '.draggable-handle'
	});

	$('#help-placeholder > #open-button, #help-placeholder-2 > #open-button').click(function () {
		var helpbox = $('#help-placeholder');
		var helpboxTwo = $('#help-placeholder-2');
		var tabContainer = $('#tabs-container');

		if (helpbox.css('display') === 'block') {
			helpbox.css('display', 'none');
			helpboxTwo.css('display', 'block');
			tabContainer.css('margin-right', '5.5%');
		} else {
			helpbox.css('display', 'block');
			helpboxTwo.css('display', 'none');
			tabContainer.css('margin-right', '17.5%');
		}
	});

	$('#save-before-leaving').dialog({
		autoOpen: false
	});

	$('.ui-tabs-nav.ui-widget-header.ui-corner-all > li > a').click(function (event) {
		if ($('meta[name="imod-is-saved"]').attr('value') === false) {
			event.preventDefault();
			$('#save-before-leaving').dialog('open');
		}
	});

	// Hide modal when background is clicked
	$(document).on('click', '.modalBackground', function () {
		var zIndex = parseInt($(this).css('z-index'), 10);
		var elem;

		$('.draggable').each(function () {
			elem = $(this);

			if (elem.prop('id') === 'add-new-technique') {
				$('.add-new-technique-form')
					.validate()
					.resetForm();
				$('#errorMessage').text('');
			}

			if (zIndex <= parseInt(elem.css('z-index'), 10)) {
				elem.hide();
			}
		});

		$(this).hide();
	});

	$(document).on('click', '.modalBackground2', function () {
		$('.modelBackground2Target').hide();
		$('.modalBackground2').hide();
	});

	// checks if a form has been submitted
	$('form').submit(function () {
		formSubmitted = true;
	});
});

window.onload = function () {
	'use strict';

	// dont apply to pedagogy and assessment tabs
	if ($('.pedagogy-nav-bar').length) {
		return null;
	}

	if ($('#contentTable').length) {
		window.cleanForm = $('form, #contentTable').find('select, textarea, input').serialize();
	} else {
		window.cleanForm = $('form').find('select, textarea, input').serialize();
	}

	return true;
};

window.onbeforeunload = function () {
	'use strict';
	var dirtyForm;

	// dont apply to pedagogy and assessment tabs
	if ($('.pedagogy-nav-bar').length) {
		return null;
	}

	if ($('#contentTable').length) {
		dirtyForm = $('form, #contentTable').find('select, textarea, input').serialize();
	} else {
		dirtyForm = $('form').find('select, textarea, input').serialize();
	}

	if (!formSubmitted && window.cleanForm !== dirtyForm) {
		return 'You have unsaved changes. Please save them before proceeding.';
	}
	return null;
};
