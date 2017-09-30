$(function () {
    upButtonHandler();
});

function upButtonHandler() {
    if (!window.InitGoUp &&
        $('div.shadow').length &&
        !(($('#mobile_link').length && $('#mobile_link').css('display') !== 'none') ||
        -1 !== $.inArray(navigator.platform, ['iPhone', 'iPad', 'iPod', 'iPhone Simulator']))
    ) {
        var buttonImage = $('<img />').load(function () {
            var classUp = $.cookie("closeUp") ? "disabledUpB" : "";
            $('body').append('\
                <div id="GOWrapper" class="'+ classUp +'">\
                    <div id="GoUpWrapper">\
                        <div id="GoUpClickZone"><p>наверх</p></div>\
                        <div id="GoUpButton"></div>\
                    </div>\
                    <div id="GoPrevButton"><span><i></i></span></div>\
                    <div class="toggleButton" id="closeButton"><i></i>скрыть</div>\
                    <p class="toggleButton" id="openButton">наверх</p>\
                </div>');
            $('.toggleButton').click(function () {
                 var self = $(this);
                 var toggleButton = function() {
                    self.parents("#GOWrapper").toggleClass("disabledUpB")
                 }
                 if ($(this).is('#openButton')) {
                    if ($('body').scrollTop() == 0){
                        var scrollrem = $('html').scrollTop();
                    } else {
                        var scrollrem = $('body').scrollTop();
                    }
                    $('html, body').scrollTop(0);
                    $('#GoPrevButton').show().click(function() {
                        $('html, body').scrollTop(scrollrem);
                    });
                    $.cookie("closeUp",null,{path:"/",domain:'kinopoisk.ru',expires:0});
                    setTimeout(toggleButton, 250);
                 } else {
                    $.cookie("closeUp",1,{path:"/",domain:'kinopoisk.ru',expires:30});
                    toggleButton();
                 }
            })
            var oldColor = $('#GoUpClickZone p').css('background-color');
            if ($('body').css('background-image').search(/noBrand/i) === -1) { // есть брендирование
                var newColor = oldColor.substr(0, oldColor.length - 1).replace('rgb', 'rgba') + ', 0.6)';
                $('#GoUpClickZone p').css('background-color', newColor);
            }

            try {
                $('#GoUpClickZone p').get(0).style.filter = 'progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#14FF6600\', endColorstr=\'#14FF6600\',GradientType=0 )';
            } catch (e) {

            }

            $('#GoUpClickZone p').hide();

            var wrapper = $('#GoUpWrapper'),
                clickZone = $('#GoUpClickZone, #GoUpClickZone p'),
                upButton = $('#GoUpButton'),
                all = $('#GoUpClickZone, #GoUpButton'),
                $window = $(window),
                $body = $('body'),
                isHidden = true,
                animationTime = 200,
                mouseInClickZone = false;

            all.hover(function (e) {
                if (!isHidden && !(e.clientX === 0 && e.clientY === 0)) {
                    if (wrapper.outerWidth() >= clickZone.outerWidth()) {
                        clickZone.stop().fadeTo(animationTime, 1);
                    }
                    upButton.stop().fadeTo(animationTime, 1);
                }
            }, function (e) {
                if (!isHidden && e.clientX >= clickZone.first().outerWidth()) {
                    clickZone.stop().fadeTo(animationTime, 0);
                    upButton.stop();// .fadeTo(animationTime, 0.2);
                }
            }).mouseenter(function (e) {
                if (!(e.clientX === 0 && e.clientY === 0)) {
                    mouseInClickZone = true;
                }
            }).mouseleave(function (e) {
                if (e.clientX >= clickZone.first().outerWidth()) {
                    mouseInClickZone = false;
                }
            }).click(function () {
                isHidden = true;
                hideAll();
                if ($('body').scrollTop() == 0){
                    var scrollrem = $('html').scrollTop();
                } else {
                    var scrollrem = $('body').scrollTop();
                }
                $('html, body').scrollTop(0);
                $('#GoPrevButton').show().click(function() {
                    $('html, body').scrollTop(scrollrem);
                });
            })
            var windowScrollTop,
                windowHeight,
                documentHeight,
                bigPage,
                toggleHeight,
                toggleTimer,
                toggleTimerLong;

            var showAll = function () {
                if (mouseInClickZone) {
                    if (wrapper.outerWidth() >= clickZone.outerWidth()) {
                        clickZone.stop().fadeTo(animationTime, 1);
                    }
                    upButton.stop().fadeTo(animationTime, 1);
                } else {
                    upButton.stop().fadeTo(animationTime, 1);
                }
                $('#GoPrevButton').hide();
                $('.toggleButton, #GoUpWrapper').show();
                isHidden = false,
                all.css('cursor', 'pointer');
            },
            hideAll = function () {
                $('.toggleButton, #GoUpWrapper').hide();
                upButton.stop().fadeTo(animationTime, 0);
                clickZone.stop().fadeTo(animationTime, 0);
                isHidden = true;
                all.css('cursor', 'auto');
            },
            toggleVisible = function(){
                clearTimeout(toggleTimer);
                clearTimeout(toggleTimerLong);
                toggleTimerLong = null;

                windowScrollTop = $window.scrollTop();
                if (isHidden && windowScrollTop > toggleHeight) {
                    showAll();
                } else if (!isHidden && windowScrollTop <= toggleHeight) {
                    hideAll();
                }
            },
            doScroll = function(){
                if (toggleTimer) {
                    clearTimeout(toggleTimer);
                }
                toggleTimer = setTimeout(toggleVisible, 150);

                if (!toggleTimerLong) {
                    toggleTimerLong = setTimeout(toggleVisible, 750);
                }
            },
            doResize = function(){
                var oldBigPage = bigPage;
                windowHeight = $window.height();
                documentHeight = $(document).height();
                bigPage = bigPage || documentHeight / windowHeight >= 2;
                toggleHeight = windowHeight * 0.8;

                if (bigPage && !oldBigPage) {
                    $window.scroll(doScroll);
                    doScroll();
                }

                if ($('div.shadow').length) {
                    wrapper.css('width', Math.min(100, ($body.width() - $('div.shadow').outerWidth()) / 2));
                    clickZone.first().css('width', wrapper.css('width'));
                }
            };

            $window.resize(doResize);
            doResize();
        }).prop('src', '//st.kp.yandex.net/images/goUp.png');
    }
}
