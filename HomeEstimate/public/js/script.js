(function($) {
	var HOST = "http://120.79.84.18:8081/"
	"use strict";
	
	//Hide Loading Box (Preloader)
	function handlePreloader() {
		if($('.preloader').length){
			$('.preloader').delay(200).fadeOut(500);
		}
	}
	
	
	//Update Header Style and Scroll to Top
	function headerStyle() {
		if($('.main-header').length){
			var windowpos = $(window).scrollTop();
			var siteHeader = $('.main-header');
			var scrollLink = $('.scroll-top');
			if (windowpos >= 110) {
				siteHeader.addClass('fixed-header');
				scrollLink.fadeIn(300);
			} else {
				siteHeader.removeClass('fixed-header');
				scrollLink.fadeOut(300);
			}
		}
	}
	
	headerStyle();

	// dropdown menu
	var mobileWidth = 992;
	var navcollapse = $('.navigation li.dropdown');
	 
	$(window).on('resize', function(){
	    navcollapse.children('ul').hide();
	});

	navcollapse.hover(function() {
	if($(window).innerWidth() >= mobileWidth){
	      $(this).children('ul').stop(true, false, true).slideToggle(300);
	    }
	});	

	//Submenu Dropdown Toggle
	if($('.main-header .navigation li.dropdown ul').length){
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><span class="fa fa-angle-down"></span></div>');		
		
		//Dropdown Button
		$('.main-header .navigation li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('ul').slideToggle(500);
		});
		
		//Disable dropdown parent link
		$('.navigation li.dropdown > a').on('click', function(e) {
			e.preventDefault();
		});
	}



	// 27. Select menu 
	function selectDropdown() {
	    if ($(".selectmenu").length) {
	        $(".selectmenu").selectmenu();

	        var changeSelectMenu = function(event, item) {
	            $(this).trigger('change', item);
	        };
	        $(".selectmenu").selectmenu({ change: changeSelectMenu });
	    };
	}


	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 }, 1000);
	
		});
	}



	// Elements Animation
	if($('.wow').length){
		var wow = new WOW({
		mobile:       false
		});
		wow.init();
	}

	//Gallery Filters
	if($('.filter-list').length){
		$('.filter-list').mixItUp({});
	}


	//Contact Form Validation
	if($('#contact-form').length){
		$('#contact-form').validate({
			rules: {
				username: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
				phone: {
					required: true
				},
				subject: {
					required: true
				},
				message: {
					required: true
				}
			}
		});
	}


	// Fact Counter
	function factCounter() {
		if($('.fact-counter').length){
			$('.fact-counter .column.animated').each(function() {
		
				var $t = $(this),
					n = $t.find(".count-text").attr("data-stop"),
					r = parseInt($t.find(".count-text").attr("data-speed"), 10);
					
				if (!$t.hasClass("counted")) {
					$t.addClass("counted");
					$({
						countNum: $t.find(".count-text").text()
					}).animate({
						countNum: n
					}, {
						duration: r,
						easing: "linear",
						step: function() {
							$t.find(".count-text").text(Math.floor(this.countNum));
						},
						complete: function() {
							$t.find(".count-text").text(this.countNum);
						}
					});
				}
				
			});
		}
	}


	//LightBox / Fancybox
	if($('.lightbox-image').length) {
		$('.lightbox-image').fancybox({
			openEffect  : 'elastic',
			closeEffect : 'elastic',
			helpers : {
				media : {}
			}
		});
	}



	//Sortable Masonary with Filters
	function enableMasonry() {
		if($('.sortable-masonry').length){
	
			var winDow = $(window);
			// Needed variables
			var $container=$('.sortable-masonry .items-container');
			var $filter=$('.filter-btns');
	
			$container.isotope({
				filter:'*',
				 masonry: {
					columnWidth : 2 
				 },
				animationOptions:{
					duration:500,
					easing:'linear'
				}
			});
			
	
			// Isotope Filter 
			$filter.find('li').on('click', function(){
				var selector = $(this).attr('data-filter');
	
				try {
					$container.isotope({ 
						filter	: selector,
						animationOptions: {
							duration: 500,
							easing	: 'linear',
							queue	: false
						}
					});
				} catch(err) {
	
				}
				return false;
			});
	
	
			winDow.bind('resize', function(){
				var selector = $filter.find('li.active').attr('data-filter');

				$container.isotope({ 
					filter	: selector,
					animationOptions: {
						duration: 500,
						easing	: 'linear',
						queue	: false
					}
				});
			});
	
	
			var filterItemA	= $('.filter-btns li');
	
			filterItemA.on('click', function(){
				var $this = $(this);
				if ( !$this.hasClass('active')) {
					filterItemA.removeClass('active');
					$this.addClass('active');
				}
			});
		}
	}


	function galleryMasonaryLayout() {
	    if ($('.masonary-layout').length) {
	        $('.masonary-layout').isotope({
	            layoutMode: 'masonry'
	        });
	    }

	    if ($('.post-filter').length) {
	        $('.post-filter li').children('a').on('click', function() {
	            var Self = $(this);
	            var selector = Self.parent().attr('data-filter');
	            $('.post-filter li').children('a').parent().removeClass('active');
	            Self.parent().addClass('active');


	            $('.filter-layout').isotope({
	                filter: selector,
	                animationOptions: {
	                    duration: 500,
	                    easing: 'linear',
	                    queue: false
	                }
	            });
	            return false;
	        });
	    }

	    if ($('.post-filter.has-dynamic-filter-counter').length) {
	        // var allItem = $('.single-filter-item').length;

	        var activeFilterItem = $('.post-filter.has-dynamic-filter-counter').find('li');

	        activeFilterItem.each(function() {
	            var filterElement = $(this).data('filter');
	            console.log(filterElement);
	            var count = $('.gallery-content').find(filterElement).length;

	            $(this).children('span').append('<span class="count"><b>' + count + '</b></span>');
	        });
	    };
	}


	// tab-content
	function customTabProductPageTab () {
	    if ($('.custom-tab-title').length) {
	        var tabWrap = $('.tab-details-content');
	        var tabClicker = $('.custom-tab-title ul li');
	        
	        tabWrap.children('div').hide();
	        tabWrap.children('div').eq(0).show();
	        tabClicker.on('click', function() {
	            var tabName = $(this).data('tab-name');
	            tabClicker.removeClass('active');
	            $(this).addClass('active');
	            var id = '#'+ tabName;
	            tabWrap.children('div').not(id).hide();
	            tabWrap.children('div'+id).fadeIn('500');
	            return false;
	        });        
	    }
	}

	// tab-content
	function customTabProductPageTab1 () {
	    if ($('.custom-tab-title-one').length) {
	        var tabWrap = $('.tab-details-content-one');
	        var tabClicker = $('.custom-tab-title-one ul li');
	        
	        tabWrap.children('div').hide();
	        tabWrap.children('div').eq(0).show();
	        tabClicker.on('click', function() {
	            var tabName = $(this).data('tab-name');
	            tabClicker.removeClass('active');
	            $(this).addClass('active');
	            var id = '#'+ tabName;
	            tabWrap.children('div').not(id).hide();
	            tabWrap.children('div'+id).fadeIn('500');
	            return false;
	        });        
	    }
	}


	//three-column-carousel
	    if ($('.three-column-carousel').length) {
			$('.three-column-carousel').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 3000,
			autoplay: 4000,
			navText: [ '<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:1
				},
				600:{
					items:2
				},
				800:{
					items:2
				},
				1024:{
					items:3
				}
			}
		});    		
	}


	//Accordion Box
	if ($('.accordion-box').length) {
	        $('.accordion-box .acc-btn').on('click', function() {
	            if ($(this).hasClass('active') !== true) {
	                $('.accordion-box .acc-btn').removeClass('active');
	            }

	            if ($(this).next('.acc-content').is(':visible')) {
	                $(this).removeClass('active');
	                $(this).next('.acc-content').slideUp(500);
	            } else {
	                $(this).addClass('active');
	                $('.accordion-box .acc-content').slideUp(500);
	                $(this).next('.acc-content').slideDown(500);
	            }
	        });
	    }


	// sponsors-slider
	if ($('.testimonial-slider').length) {
		$('.testimonial-slider').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 3000,
			autoplay: 4000,
			navText: [ '<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				400:{
					items:1
				},
				600:{
					items:1
				},
				800:{
					items:1
				},
				1200:{
					items:1
				}
			}
		});    		
	}


	//Main Slider Carousel
	if ($('.main-slider-carousel').length) {
		$('.main-slider-carousel').owlCarousel({
			loop:true,
			margin:0,
			nav:true,
			animateOut: 'slideOutDown',
    		animateIn: 'fadeIn',
    		active: true,
			smartSpeed: 1000,
			autoplay: 5000,
			navText: [ '<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:1
				},
				1200:{
					items:1
				}
			}
		});    		
	}
	
	




	/*	=========================================================================
	When document is Scrollig, do
	========================================================================== */

	jQuery(document).on('ready', function () {
		(function ($) {
			// add your functions
			customTabProductPageTab ();
			customTabProductPageTab1 ();
		})(jQuery);
	});



	/* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */
	
	$(window).on('scroll', function() {
		headerStyle();
		factCounter();
	});

	
	
	/* ==========================================================================
   When document is loaded, do
   ========================================================================== */
   function GetUrlParam(paraName) {
	　　　　var url = document.location.toString();
	　　　　var arrObj = url.split("?");
	
	　　　　if (arrObj.length > 1) {
	　　　　　　var arrPara = arrObj[1].split("&");
	　　　　　　var arr;
	
	　　　　　　for (var i = 0; i < arrPara.length; i++) {
	　　　　　　　　arr = arrPara[i].split("=");
	
	　　　　　　　　if (arr != null && arr[0] == paraName) {
	　　　　　　　　　　return arr[1];
	　　　　　　　　}
	　　　　　　}
	　　　　　　return "";
	　　　　}
	　　　　else {
	　　　　　　return "";
	　　　　}
	　　}
	$(window).on('load', function() {
		handlePreloader();
		enableMasonry();
		galleryMasonaryLayout();
	});
	$("#address").click(function(){
		var address = $("input[name=address]").val();
		PostAddress(address)
	})
	$("#info").click(function(){
		var firstName = $("input[name=firstName]").val();
		var lastName = $("input[name=lastName]").val();
		var email = $("input[name=email]").val();
		personal(firstName,lastName,email)
	})
	$("#edit").click(function(){
		var debt = $("input[name=debt]").val();
		webDebt(debt)
	})
	$("#selfIdentity").click(function(){
		var _id = GetUrlParam("_id")
		var estimatePrice = GetUrlParam("estimatePrice")
		window.location.href = 'assessment-edit.html?_id='+_id + '&estimatePrice='+estimatePrice;
	})
	$("#approve").click(function(){
		var _id = GetUrlParam("_id")
		window.location.href = 'assessment-certificate.html?_id='+_id;
	})
	
	/*
	 * Post the address to the system
	 * @parameters string address address to post
	 */
	function PostAddress(address){
		$.ajax({
			url: HOST + 'web/address',
			data: {
				address: address,
			},
			dataType: 'JSON',
			async: false,//请求是否异步，默认为异步
			type: 'POST',
			success: function (res) {
				if(res.success){
					window.location.href = 'assessment-info.html?_id='+res.data._id;
				}else{
					alert(res.msg)
				}
			},
			error: function () {
			}
		});		
	}
	/*
	 * Post the personal information
	 * @parameters string firstName 
	 * @parameters string lastName 
	 * @parameters string email 
	 * @parameters string _id the _id of mongodb
	 */
	function personal(firstName,lastName,email){
		var _id = GetUrlParam("_id")
		$.ajax({
			url: HOST + 'web/personal',
			data: {
				firstName: firstName,
				lastName: lastName,
				email: email,
				_id:_id,
			},
			dataType: 'JSON',
			async: false,//请求是否异步，默认为异步
			type: 'POST',
			success: function (res) {
				console.log(res)
				if(res.success){
					window.location.href = 'assessment-selfIdentity.html?_id='+res.data._id+'&estimatePrice='+res.data.estimates[0].estimatePrice;
				}else{
					alert(res.msg)
				}
			},
			error: function () {
			}
		});		
	}
	/*
	 * Post the debt
	 * @parameters string debt bank arrears
	 * @parameters string _id the _id of mongodb
	 */
	function webDebt(debt){
		var _id = GetUrlParam("_id")
		$.ajax({
			url: HOST + 'web/debt',
			data: {
				debt: debt,
				_id:_id,
			},
			dataType: 'JSON',
			async: false,//请求是否异步，默认为异步
			type: 'POST',
			success: function (res) {
				console.log(res)
				if(res.success){
					window.location.href = 'assessment-approve.html?_id='+res.data._id;
				}else{
					alert(res.msg)
				}
			},
			error: function () {
			}
		});		
	}
	/*
	 * Confirm to post the personal information
	 * @parameters string firstName 
	 * @parameters string lastName 
	 * @parameters string email 
	 * @parameters string phone 
	 * @parameters string _id the _id of mongodb
	 */
	function personalConfirm(){
		$.ajax({
			url: HOST + 'web/personalConfirm',
			data: {
				firstName: firstName,
				lastName: lastName,
				email: email,
				phone: phone,
				_id:_id,
			},
			dataType: 'JSON',
			async: false,//请求是否异步，默认为异步
			type: 'POST',
			success: function (res) {
			},
			error: function () {
			}
		});		
	}
})(window.jQuery);