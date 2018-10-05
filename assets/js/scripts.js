function scroll_to(clicked_link, nav_height) {
	var element_class = clicked_link.attr('href').replace('#', '.');
	var scroll_to = 0;
	if (element_class != '.top-content') {
		element_class += '-container';
		scroll_to = $(element_class).offset().top - nav_height;
	}
	if ($(window).scrollTop() != scroll_to) {
		$('html, body').stop().animate({scrollTop: scroll_to}, 1000);
	}
}

function isElementInViewport(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while(el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }

    return (
        top >= window.pageYOffset &&
        left >= window.pageXOffset &&
        (top + height) <= (window.pageYOffset + window.innerHeight) &&
        (left + width) <= (window.pageXOffset + window.innerWidth)
    );
}

var initPlansListTemplates = null;

var pricingJSON = null;
$.getJSON("assets/pricing.json", function(data) {
	pricingJSON = data;
	initPlansListTemplates = function() {
		var plansObj = pricingJSON['plans'];
		var contentTemplates = '';
		for (var key in plansObj) {
			if (!plansObj.hasOwnProperty(key)) {
				return;
			}
			var plan = plansObj[key];
			var credits = plan.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			var ppreachout = (plan.price/plan.credits).toFixed(2);
			contentTemplates += '<div class="plan-wrapper col-xs-3">'+
									'<div class="plan-header">'+
										'<h3 class="m-0">'+ plan.name +'</h3>'+
										'<span>/'+ plan.type +'/</span>'+
									'</div>'+
									'<div class="plan-specs">'+
										'<ul>'+
											'<li><strong>'+ credits +'</strong> credits</li>'+
											'<li><strong>€ '+ ppreachout +'</strong> /reachout</li>'+
											'<li><strong>€ '+ plan.price +'</strong> total price</li>'+
										'</ul>'+
									'</div>'+
								'</div>';
		}
		$('#plansListCont').append(contentTemplates).hide();
	}();
});

var findIrianaPlan = function(calls) {
		if(pricingJSON === null) {
			return;
		}
        var plansObj = pricingJSON['plans'];
        var plansCreditsArr = [];
        var plansKeyArr = [];

        // loop through all plans credits and push them to plansCreditsArr
        for (var key in plansObj) {
            if (plansObj.hasOwnProperty(key)) {
                plansKeyArr.push(key);
                plansCreditsArr.push(plansObj[key].credits);
            }
        }

        // find closest plan to calls count defined by user
        var fitPlan = Math.max.apply(null, plansCreditsArr); // Get largest credits number in case it matches nothing

        var closePlan = 0;

        // if fitPlan found is less than 20% above any plan - suggest the one that fits into and the previous one (closePlan)
        for (var i = 0; i < plansCreditsArr.length; i++) {
            if(plansCreditsArr[i] >= calls && plansCreditsArr[i] < fitPlan)
                fitPlan = plansCreditsArr[i];
            if((plansCreditsArr[i] < calls && (calls - plansCreditsArr[i]) <= (0.2 * plansCreditsArr[i])))
                closePlan = plansCreditsArr[i];
        }

        // if specified reachouts exceed our largest plan set fitPlan to 0 - we don't have such in our pricing and offer custom one
		var maxPlanCredits = Math.max.apply( Math, plansCreditsArr );
        if(calls > maxPlanCredits) {
        	fitPlan = 0;
        }

        if(closePlan > 0) {
            var extraPriceBoxTmpl = '<div class="col-sm-4 pricing-box" id="extraPlanBox">'+
                '<div class="pricing-box-inner">'+
                '<div class="pricing-box-header"><strong></strong><i class="fa fa-asterisk" aria-hidden="true"></i></div>'+
                '<h4 class="plan-type"></h4>'+
                '<div class="pricing-box-features">'+
                '<ul>'+
                '<li class="credits"><strong></strong><span> credits</span></li>'+
                '<li class="total"><i class="fa fa-eur" aria-hidden="true"></i><strong></strong><span> total price</span></li>'+
                '</ul>'+
                '</div>'+
                '</div>'+
                '</div>';
            var planName = plansKeyArr[plansCreditsArr.indexOf(closePlan)];
            var planPrice = plansObj[plansKeyArr[plansCreditsArr.indexOf(closePlan)]].price;

            var priceBoxNoteTmpl = '<div class="pricing-box-note col-sm-8 col-sm-offset-4"><i class="fa fa-asterisk" aria-hidden="true"></i>'
                +'Suggested plan on condition that the reachout amount is decreased to the specified plan credits.</div>';



            if($('#extraPlanBox').length <= 0)
                $('.post-calc').append(extraPriceBoxTmpl, priceBoxNoteTmpl).find('#calcPlanBox').removeClass('col-sm-offset-2');
            var $extraPlanBoxEl = $('#extraPlanBox');
            $extraPlanBoxEl.css({'border-left':'1px solid #ccc', 'border-left-style':'dashed'});
            $extraPlanBoxEl.find('.pricing-box-header > strong').text(plansObj[planName].name);
            $extraPlanBoxEl.find('.plan-type').text('/'+plansObj[planName].type+'/');
            $extraPlanBoxEl.find('.pricing-box-features .credits').children('strong').text(closePlan);
            $extraPlanBoxEl.find('.pricing-box-features .total').children('strong').text(planPrice);
        } else {
            $('#extraPlanBox, .pricing-box-note').remove();
            if(!$('.post-calc').find('#calcPlanBox').hasClass('col-sm-offset-2')) {
                $('#calcPlanBox').addClass('col-sm-offset-2');
            }
        }

        // get the name of closest plan that fits
        var fitPlanName = plansKeyArr[plansCreditsArr.indexOf(fitPlan)] !== undefined ? plansKeyArr[plansCreditsArr.indexOf(fitPlan)] : '*';
        var foundPlanName, foundPlanType, foundPlanCredits, foundPlanPrice, pricePerCall;

		if(fitPlanName !== '*') {
			// get price for fitting plan and calculate price per call
			foundPlanName = plansObj[fitPlanName].name;
			foundPlanType = plansObj[fitPlanName].type;
			foundPlanCredits = fitPlan;
			foundPlanPrice = plansObj[fitPlanName].price;
			pricePerCall = (foundPlanPrice/foundPlanCredits).toFixed(2);

			$('.pricing-box-features li').css('padding','18px 20px');
			$('#contact-us').hide();
		} else {
			pricePerCall = foundPlanName = foundPlanCredits = foundPlanPrice =  'Custom';
			foundPlanType = 'plan *';

			$('.pricing-box-features li').css('padding','5px 20px');
			$('#contact-us').show();
		}

        // fill data in pricing plan calculator box
        var $calcPlanBoxEl = $('#calcPlanBox');
        $calcPlanBoxEl.find('.box-price.per-reachout').children('strong').text(pricePerCall);
        $calcPlanBoxEl.find('.box-price.reachouts').children('strong').text(foundPlanCredits);

        // fill data in found pricing plan box
        var $foundPlanBoxEl = $('#foundPlanBox');

        $foundPlanBoxEl.find('.pricing-box-header > strong').text(foundPlanName);
        $foundPlanBoxEl.find('.plan-type').text('/'+foundPlanType+'/');
        $foundPlanBoxEl.find('.pricing-box-features .credits').children('strong').text(foundPlanCredits);
        $foundPlanBoxEl.find('.pricing-box-features .total').children('strong').text(foundPlanPrice);
};

function isFormMailValid(mail) {
	return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail));
}

function isFormPhoneValid(phone) {
	return (/^\+?[\- 0-9]{4,}$/.test(phone));
}


function isContactFormValid() {
	var $form = $('.c-form-1-box form');
	var validity = true;
	$form.find('input, textarea').each(function() {
		var id = $(this).attr('id');
		var idArr = id.split('-');
		var field = idArr[idArr.length - 1];
		var errMsg = '';

		switch(field) {
			case 'fname':
				errMsg = 'Empty first name!';
				break;
			case 'lname':
				errMsg = 'Empty last name!';
				break;
			case 'phone':
				errMsg = 'Empty phone number!';
				break;
			case 'email':
				errMsg = 'Empty email address!';
				break;
			case 'company':
				errMsg = 'Empty company name!';
				break;
			case 'message':
				errMsg = 'Empty message!';
				break;
		}

		// Check if form field is empty and display error message
		if ($(this).val() === '') {
			validity = false;
			$('.c-form-1-box label[for="' + id + '"] .c-form-1-error').fadeOut('fast', function () {
				$(this).html('(' + errMsg + ')').fadeIn('fast');
			});
		} else {
			$('.c-form-1-box label[for="' + id + '"] .c-form-1-error').fadeOut('fast');
		}

		var phone = $form.find('input[id="c-form-1-phone"]').val();
		// Check for invalid phone number
		if(!isFormPhoneValid(phone)) {
			validity = false;
			$('.c-form-1-box label[for="c-form-1-phone"] .c-form-1-error').fadeOut('fast', function () {
				$(this).html('(Invalid phone number!)').fadeIn('fast');
			});
		}

		var email = $form.find('input[id="c-form-1-email"]').val();
		// Check for invalid email address
		if(!isFormMailValid(email)) {
			validity = false;
			$('.c-form-1-box label[for="c-form-1-email"] .c-form-1-error').fadeOut('fast', function () {
				$(this).html('(Invalid email address!)').fadeIn('fast');
			});
		}
	});

	return validity;
}

jQuery(document).ready(function () {
	/*
	 Navigation
	 */
	$('a.scroll-link').on('click', function (e) {
		e.preventDefault();

		scroll_to($(this), $('nav').height());
	});

	$('.back-link, .contacts-link').hide();

	$('.back-link').on('click', function (e) {
		e.preventDefault();

		$('.section-container').waypoint({
			handler: function(direction) {
				ga && ga('set', 'page', $(this).attr('data-page'));
				location.hash = $(this).attr('data-page');
			},
			offset: 70
		});

		$('#Features').click();
	});

	// toggle "navbar-no-bg" class
	$('.top-content .text').waypoint(function () {
		$('nav').toggleClass('navbar-no-bg');
	});

	/*
	 Background slideshow
	 */
	$('.top-content').backstretch("assets/img/backgrounds/1.jpg");
	$('.how-it-works-container').backstretch("assets/img/backgrounds/2.jpg");
	$('.why-iriana-container').backstretch("assets/img/backgrounds/4.jpg");
	$('.about-us-container').backstretch("assets/img/backgrounds/2.jpg");
	$('.contact-container').backstretch("assets/img/backgrounds/3.jpg");

	$('#top-navbar-1').on('shown.bs.collapse', function () {
		$('.top-content').backstretch("resize");
	});
	$('#top-navbar-1').on('hidden.bs.collapse', function () {
		$('.top-content').backstretch("resize");
	});

	$('a[data-toggle="tab"]').on('shown.bs.tab', function () {
		$('.why-iriana-container').backstretch("resize");
	});

	/*
	 Wow
	 */
	new WOW().init();

	/*
	 Modals
	 */
	$('.launch-modal').on('click', function (e) {
		e.preventDefault();
		$('#' + $(this).data('modal-id')).modal();
	});

	/*
	 Key features section
	 */
	$('#featuresContainer').children('div.row').each(function() {
		$(this).children('div.features-box').each(function() {
			var $this = $(this);
			$(this).find('.feature-extended').hide();
			$(this).find('.features-box-icon').unbind().click(function() {
				var $feature = $(this);
				// Update location hash
				location.hash = "Features/" + $this.attr('id').split('f_')[1];
				// Disable waypoints here
				$('.section-container').waypoint('disable');
			});
		})
	});

	function showLandingPageFor($feature) {
		var $mainSectionContainers = $('.how-it-works-container, .pricing-container, .why-iriana-container, .contact-us-container');
		var $nav = $('nav');

		// hide unneeded sections
		$mainSectionContainers.hide();
		$mainSectionContainers.backstretch('resize');

		// hide main description of Features section + all condensed Features
		var $parent = $feature.parents('#featuresContainer');
		$parent.find('#fMainDescription').parent().hide(200);
		$parent.find('.features-box').children('.feature-condensed').hide(200);

		// hide all links from nav-bar except login and show back
		$nav.find('.navbar-nav li > a.scroll-link').hide();
		$nav.find('.navbar-nav li > a.back-link').show();

		// show landing page content
		$feature.parents('div.features-box').find('.feature-extended').show();

		// scroll to beginning of landing page's parent container
		$('body, html').animate({
			scrollTop: $('#featuresContainer').position().top - 73 // the height of navigation bar when collapsed
		}, 500);
	}

	function showMainContent() {
		var $mainSectionContainers = $('.how-it-works-container, .pricing-container, .why-iriana-container, .contact-us-container');
		var $nav = $('nav');

		// show all section containers
		$mainSectionContainers.show();
		$mainSectionContainers.backstretch('resize');

		// hide features's landing pages' content and show condensed ones + sections description
		var $featuresCont = $('.features-container');
		$featuresCont.find('#fMainDescription').parent().show(400);
		$featuresCont.find('.feature-extended').hide();
		$featuresCont.find('.feature-condensed').show(400);

		// show nav-links and hide back link
		$nav.find('.navbar-nav li > a.scroll-link').show();
		$nav.find('.navbar-nav li > a.back-link').hide();

		// Enable waypoints here
		$('.section-container').waypoint('enable');
	}

	/*
	 Init correct content depending on location hash
	 */
	if(location.hash.indexOf('Features/') !== -1) {
		var featureId = location.hash.split('#Features/')[1];
		var $feature = $('#f_'+featureId).find('.features-box-icon');
		showLandingPageFor($feature);
	} else {
		$('.section-container').waypoint({
			handler: function(direction) {
				ga && ga('set', 'page', $(this).attr('data-page'));
				location.hash = $(this).attr('data-page');
			},
			offset: 100
		});
		showMainContent();
		$(location.hash).click();
	}

	/*
	 Add event listeners for browser's back and forward buttons
	 */
	window.addEventListener('hashchange', function (e) {
		var hash = window.location.hash;
		if (hash.indexOf('#Features/') !== -1) {
			// We are navigating to some feature's landing page
			var featureId = '#f_'+hash.split('#Features/')[1];
			var $feature = $(featureId).find('.features-box-icon');
			showLandingPageFor($feature);
			$('.section-container').waypoint('disable');
		} else {
			showMainContent();
		}
	});

	/*
	 Pay as you go section
	 */
	$('.selected-country').unbind().click(function() {
		$('#selected-country-txt').text($(this).text());
	});

	/*
	 Prefixes table
	 */
    $('#prefixesList').bootstrapTable({
        url: 'https://my.iriana.io/api/v1/prefixes',
        columns: [
            {
                field: '0',
                title: 'Country',
                align: 'left'
            },
            {
                field: '1',
                title: 'Operator',
                align: 'left'
            },
            {
                field: '2',
                title: 'Prefix',
                align: 'left'
            }
        ],
        onLoadError: function (status, response) {
            console.error(response);
        }
    });

	$('#prefixesListBtn').unbind().click(function () {
		$("#plansListCont").slideUp('slow');
		$("#prefixesListCont").slideToggle('slow');
    });

	$('#plansListBtn').unbind().click(function () {
		$("#prefixesListCont").slideUp('slow');
		$("#plansListCont").slideToggle('slow');
	});

	$('#findPlanBtn').unbind().click(function() {
		var callsCount = $('#calls-count-input').val();

		// an error message to be displayed in case some of the required info is missing
		var $calcErrMsg = $('.pricing-error-msg');

		// check if information is valid
		if(callsCount > 0) {
			findIrianaPlan(callsCount);
            $calcErrMsg.addClass('hidden');
			$('.post-calc.row').removeClass('hidden');
		} else {
			$('.post-calc.row').addClass('hidden');
            $calcErrMsg.removeClass('hidden');
		}
	});

    $(document).keypress(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
        {
        	// check if pricing section is active and user is trying to find a plan on pressing enter
            if(isElementInViewport($('.pricing-container')[0])) {
				$('#findPlanBtn').click();
            }
        }
    });

	/*
	 Contact form
	 */
	var $form = $('.c-form-1-box form');
	// allow user to enter only digits, space and + in phone number field
	$form.find('input[id="c-form-1-phone"]').bind('keypress', function (e) {

		if (!(/^[+?\- 0-9]$/.test(e.key))) {
			e.preventDefault();
		}
	});
	// submit form
	$form.on('submit', function (e) {
		e.preventDefault();

		// JS form validation
		if(!isContactFormValid()) return;

		var this_form_parent = $(this).parents('.c-form-1-box');
		var postdata = $(this).serialize();

		$.ajax({
			type: 'POST',
			url: 'assets/contact.php',
			data: postdata,
			dataType: 'json',
			success: function (json) {
				$('.c-form-1-box label[for="c-form-1-fname"] .c-form-1-error').fadeOut('fast', function () {
					if (json.firstNameMessage != '') {
						$(this).html('(' + json.firstNameMessage + ')').fadeIn('fast');
					}
				});
				$('.c-form-1-box label[for="c-form-1-lname"] .c-form-1-error').fadeOut('fast', function () {
					if (json.lastNameMessage != '') {
						$(this).html('(' + json.lastNameMessage + ')').fadeIn('fast');
					}
				});
				$('.c-form-1-box label[for="c-form-1-company"] .c-form-1-error').fadeOut('fast', function () {
					if (json.companyMessage != '') {
						$(this).html('(' + json.companyMessage + ')').fadeIn('fast');
					}
				});
				$('.c-form-1-box label[for="c-form-1-email"] .c-form-1-error').fadeOut('fast', function () {
					if (json.emailMessage != '') {
						$(this).html('(' + json.emailMessage + ')').fadeIn('fast');
					}
				});
				$('.c-form-1-box label[for="c-form-1-phone"] .c-form-1-error').fadeOut('fast', function () {
					if (json.phoneMessage != '') {
						$(this).html('(' + json.phoneMessage + ')').fadeIn('fast');
					}
				});
				$('.c-form-1-box label[for="c-form-1-message"] .c-form-1-error').fadeOut('fast', function () {
					if (json.messageMessage != '') {
						$(this).html('(' + json.messageMessage + ')').fadeIn('fast');
					}
				});
				if (json.firstNameMessage == '' && json.lastNameMessage == '' && json.companyMessage == ''
					&& json.emailMessage == '' && json.phoneMessage == '' && json.messageMessage == '') {
					this_form_parent.find('.c-form-1-top').fadeOut('fast');
					this_form_parent.find('.c-form-1-bottom').fadeOut('fast', function () {
						this_form_parent.append('<h3>Thank you for your interest in our product Iriana.<br/>Our representative will contact you within the next 48 hours.</h3>');
						$('.contact-container').backstretch("resize");
					});
				}
			}
		});
	});
});

jQuery(window).load(function () {

	/*
	 Hidden images
	 */
	$(".modal-body img, .why-iriana-image img").attr("style", "width: auto !important; height: auto !important;");

});
