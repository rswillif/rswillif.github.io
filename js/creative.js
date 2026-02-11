(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 60)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 100
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Closes the Responsive Menu when clicking outside of it
    $(document).click(function(event) {
        var clickover = $(event.target);
        var _opened = $(".navbar-collapse").hasClass("in");
        // Check if click is outside the menu AND outside the toggle button
        if (_opened === true && !clickover.closest('.navbar-toggle').length && !clickover.closest('.navbar-collapse').length) {
            $('.navbar-toggle:visible').click();
        }
    });

    // Auto-collapse navbar on scroll to prevent it "staying open" when moving
    $(window).scroll(function() {
        if ($(".navbar-collapse").hasClass("in")) {
            $('.navbar-toggle:visible').click();
        }
    });

    // Refresh ScrollSpy after a delay to ensure positions are correct
    $(window).on('load', function () {
        $('body').scrollspy('refresh');
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize and Configure Scroll Reveal Animation
    window.sr = ScrollReveal();
    sr.reveal('.sr-icons', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 200);
    sr.reveal('.sr-button', {
        duration: 1000,
        delay: 200
    });
    sr.reveal('.sr-contact', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 300);

    // Safety Fallback: Ensure elements are visible if ScrollReveal fails or lags
    setTimeout(function() {
        $('.sr-icons, .sr-button, .sr-contact').css({
            'visibility': 'visible',
            'opacity': '1',
            'transform': 'none'
        });
    }, 3000);

    // Initialize and Configure Magnific Popup Lightbox Plugin
    $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
        }
    });

    // Mobile Hover-on-Scroll Polyfill
    // Only activate on touch devices to preserve desktop hover UX
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        var observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% visible
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-active');
                } else {
                    entry.target.classList.remove('scroll-active');
                }
            });
        }, observerOptions);

        var elements = document.querySelectorAll('.service-box, .call-to-action');
        elements.forEach(function(el) {
            observer.observe(el);
        });
    }

})(jQuery); // End of use strict

/* Recent Transmissions Fetcher */
(function($) {
    "use strict";

    function renderPosts(posts) {
        var container = $('#posts-container');
        var loader = $('#posts-loader');
        
        container.empty();
        
        posts.forEach(function(post) {
            var tile = $('<a class="post-tile" target="_blank" rel="noopener noreferrer"></a>');
            tile.attr('href', post.link || '#');
            
            if (post.isRepost) tile.addClass('repost');
            
            var date = $('<div class="date"></div>').text(post.date);
            var content = $('<div class="content"></div>').text(post.content);
            var handle = $('<div class="handle"></div>').text(post.handle);
            
            tile.append(date, content, handle);
            container.append(tile);
        });
        
        // Immediate render
        loader.hide();
    }

    $(document).ready(function() {
        // Manual Scroll Restoration
        var scrollPos = sessionStorage.getItem('scrollPos');
        if (scrollPos) {
            $(window).scrollTop(scrollPos);
        }

        $(window).on('scroll', function() {
            sessionStorage.setItem('scrollPos', $(window).scrollTop());
        });

        // Fetch JSON data (Standard Web Practice)
        $.getJSON('data/posts.json')
            .done(function(data) {
                if (data && data.length > 0) {
                    $('#recent-posts').show();
                    renderPosts(data);
                    // Re-trigger ScrollReveal for the new content if needed, 
                    // though manual reveal might be required if it was hidden initially.
                    // For now, simple show() is the request.
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.error("Signal Lost:", err);
                $('#recent-posts').hide();
            });
    });

})(jQuery);
