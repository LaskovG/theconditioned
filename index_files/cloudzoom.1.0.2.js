//////////////////////////////////////////////////////////////////////////////////
// Cloud Zoom V1.0.2
// (c) 2010 by R Cecco. <http://www.professorcloud.com>
// MIT License
//
// Please retain this copyright header in all versions of the software
//////////////////////////////////////////////////////////////////////////////////
(function ($) {

    function format(str) {
        for (var i = 1; i < arguments.length; i++) {
            str = str.replace('%' + (i - 1), arguments[i]);
        }
        return str;
    }

    // функция которая рисует всё
    function CloudZoom(jWin, opts) {
        var mouse_in = false; // находимся ли мы над постером или нет
        var sImg = $('img', jWin);
            var img1;
            var img2;
        var zoomDiv = null;
            var $mouseTrap = null;
            var lens = null;
            var $tint = null;
            var softFocus = null;
            var $ie6Fix = null;
            var zoomImage;
        var controlTimer = 0;
        var showTimer = 0;
        var showTrue = false; // был ли показан зумер полностью хотя бы раз
        var showTrueSelf = false; // был ли показан зумер полностью в данный конкретный случай
        var cw, ch;
        var destU = 0;
            var destV = 0;
        var currV = 0;
        var currU = 0;
        var filesLoaded = 0;
        var mx,
            my;
        var ctx = this, zw;

        var ie6FixRemove = function () {

            if ($ie6Fix !== null) {
                $ie6Fix.remove();
                $ie6Fix = null;
            }
        };

        // Removes cursor, tint layer, blur layer etc.
        this.removeBits = function () {
            //$mouseTrap.unbind();
            if (lens) {
                lens.remove();
                lens = null;
            }
            if ($tint) {
                $tint.remove();
                $tint = null;
            }
            if (softFocus) {
                softFocus.remove();
                softFocus = null;
            }
            ie6FixRemove();

            $('.cloud-zoom-loading', jWin.parent()).remove();
        };


        this.destroy = function () {
            jWin.data('zoom', null);

            if ($mouseTrap) {
                $mouseTrap.unbind();
                $mouseTrap.remove();
                $mouseTrap = null;
            }
            if (zoomDiv) {
                zoomDiv.remove();
                zoomDiv = null;
            }
            //ie6FixRemove();
            this.removeBits();
            // DON'T FORGET TO REMOVE JQUERY 'DATA' VALUES
        };


        // This is called when the zoom window has faded out so it can be removed.
        this.fadedOut = function () {
            if (zoomDiv) {
                zoomDiv.remove();
                zoomDiv = null;
            }
            this.removeBits();
            //ie6FixRemove();
        };

        this.controlLoop = function () {
            if (lens) {
                var x = (mx - sImg.offset().left - (cw * 0.5)) >> 0;
                var y = (my - sImg.offset().top - (ch * 0.5)) >> 0;

                if (x < 0) {
                    x = 0;
                }
                else if (x > (sImg.outerWidth() - cw)) {
                    x = (sImg.outerWidth() - cw);
                }
                if (y < 0) {
                    y = 0;
                }
                else if (y > (sImg.outerHeight() - ch)) {
                    y = (sImg.outerHeight() - ch);
                }

                lens.css({
                    left: x,
                    top: y
                });
                lens.css('background-position', (-x) + 'px ' + (-y) + 'px');

                destU = (((x) / sImg.outerWidth()) * zoomImage.width) >> 0;
                destV = (((y) / sImg.outerHeight()) * zoomImage.height) >> 0;
                currU += (destU - currU) / opts.smoothMove;
                currV += (destV - currV) / opts.smoothMove;

                zoomDiv.css('background-position', (-(currU >> 0) + 'px ') + (-(currV >> 0) + 'px'));
            }
            controlTimer = setTimeout(function () {
                ctx.controlLoop();
            }, 30);
        };

        this.run = function() {
            img1 = new Image();
            img1.src = sImg.attr('src');
            $(img1).load(function () {
                ctx.init2(this, 0);
            });

            img2 = new Image();
            img2.src = jWin.attr('href');
            $(img2).load(function () {
                if (img2.width > opts.zoomWidth && img2.height > opts.zoomHeight && (img2.width > opts.zoomWidht+20 || img2.height > opts.zoomHeight+20)) {
                    ctx.init2(this, 1);
                }
            });
        }

        this.init2 = function (img, id) {
            filesLoaded++;
            if (id === 1) {
                zoomImage = img;
            }
            if (filesLoaded === 2) {
                this.init();
            }
        };

        // скрываем линзу и большую картинку
        this.hideZoom = function (event) {
            ctx.showTrueSelf = false;
            clearTimeout(controlTimer);
            //event.data.removeBits();
            if (lens) { lens.stop(true, false).fadeOut(299); }
            if ($tint) { $tint.stop(true, false).fadeOut(299); }
            if (softFocus) { softFocus.stop(true, false).fadeOut(299); }
            if (zoomDiv) {
                zoomDiv.stop(true, false).fadeOut(300, function () {
                    ctx.fadedOut();
                });
            }
            return false;
        }
        // показываем линзу и большую картинку
        this.showZoom = function (event) {
            if (lens || !ctx.mouse_in) {
                return false;
            }
//            mx = event.pageX;
//            my = event.pageY;
//            zw = event.data;
            if (zoomDiv) {
                zoomDiv.stop(true, false);
                zoomDiv.remove();
            }

            var xPos = opts.adjustX,
                yPos = opts.adjustY;

            var siw = sImg.outerWidth();
            var sih = sImg.outerHeight();

            var w = opts.zoomWidth;
            var h = opts.zoomHeight;
            if (opts.zoomWidth == 'auto') {
                w = siw;
            }
            if (opts.zoomHeight == 'auto') {
                h = sih;
            }
            //$('#info').text( xPos + ' ' + yPos + ' ' + siw + ' ' + sih );
            var appendTo = jWin.parent(); // attach to the wrapper
            switch (opts.position) {
            case 'top':
                yPos -= h; // + opts.adjustY;
                break;
            case 'right':
                xPos += siw; // + opts.adjustX;
                break;
            case 'bottom':
                yPos += sih; // + opts.adjustY;
                break;
            case 'left':
                xPos -= w; // + opts.adjustX;
                break;
            case 'inside':
                w = siw;
                h = sih;
                break;
                // All other values, try and find an id in the dom to attach to.
            default:
                appendTo = $('#' + opts.position);
                // If dom element doesn't exit, just use 'right' position as default.
                if (!appendTo.length) {
                    appendTo = jWin;
                    xPos += siw; //+ opts.adjustX;
                    yPos += sih; // + opts.adjustY;	
                } else {
                    w = appendTo.innerWidth();
                    h = appendTo.innerHeight();
                }
            }

            zoomDiv = appendTo.append(format('<div id="cloud-zoom-big" class="cloud-zoom-big" style="display:none;position:absolute;left:%0px;top:%1px;width:%2px;height:%3px;background-image:url(\'%4\');z-index:99;"></div>', xPos, yPos, w, h, zoomImage.src)).find(':last');

            // Add the title from title tag.
            if (sImg.attr('title') && opts.showTitle) {
                zoomDiv.append(format('<div class="cloud-zoom-title">%0</div>', sImg.attr('title'))).find(':last').css('opacity', opts.titleOpacity);
            }

            // Fix ie6 select elements wrong z-index bug. Placing an iFrame over the select element solves the issue...
            if ($.browser.msie && $.browser.version < 7) {
                $ie6Fix = $('<iframe frameborder="0" src="#"></iframe>').css({
                    position: "absolute",
                    left: xPos,
                    top: yPos,
                    zIndex: 99,
                    width: w,
                    height: h
                }).insertBefore(zoomDiv);
            }

            zoomDiv.fadeIn(500, function(){
                ctx.showTrue = true; // был ли показан зумер полностью хотя бы раз
                ctx.showTrueSelf = true; // был ли показан зумер полностью в данный конкретный случай
            });

            if (lens) {
                lens.remove();
                lens = null;
            } /* Work out size of cursor */
            cw = (sImg.outerWidth() / zoomImage.width) * zoomDiv.width();
            ch = (sImg.outerHeight() / zoomImage.height) * zoomDiv.height();

            // Attach mouse, initially invisible to prevent first frame glitch
            lens = jWin.append(format("<div class='cloud-zoom-lens' style='display:none;z-index:98;position:absolute;width:%0px;height:%1px;'></div>", cw, ch)).find(':last');

            var noTrans = false;

            // Init tint layer if needed. (Not relevant if using inside mode)
            if (opts.tint) {
                lens.css('background', 'url("' + sImg.attr('src') + '")');
                $tint = jWin.append(format('<div style="display:none;position:absolute; left:0px; top:0px; width:%0px; height:%1px; background-color:%2;" />', sImg.outerWidth(), sImg.outerHeight(), opts.tint)).find(':last');
                $tint.css('opacity', opts.tintOpacity);
                noTrans = true;
                $tint.stop(true, false).fadeIn(500);
            }
            if (opts.softFocus) {
                lens.css('background', 'url("' + sImg.attr('src') + '")');
                softFocus = jWin.append(format('<div style="position:absolute;display:none;top:2px; left:2px; width:%0px; height:%1px;" />', sImg.outerWidth() - 2, sImg.outerHeight() - 2, opts.tint)).find(':last');
                softFocus.css('background', 'url("' + sImg.attr('src') + '")');
                softFocus.css('opacity', 0.5);
                noTrans = true;
                softFocus.stop(true, false).fadeIn(500);
            }

            if (!noTrans) {
                lens.css('opacity', opts.lensOpacity);
            }
            if ( opts.position !== 'inside' ) { lens.stop(true, false).fadeIn(500); }

            // считаем что зумер загружен и показан пользователю
            //ctx.showTrue = true;

            // запускаем перемещение по картинке
            ctx.controlLoop();
            return; // Don't return false here otherwise opera will not detect change of the mouse pointer type.
        }

        /* Init function start.  */
        this.init = function () {
            $('.cloud-zoom-loading', jWin.parent()).remove();

            jWin.bind('mousemove', this, function (event) {
                event.stopPropagation();
                mx = event.pageX;
                my = event.pageY;
            });

            $('#photoBlock .addFolder, #photoBlock .popupVideo').bind('mousemove', this, function (event) {
                if (ctx.showTrueSelf) {
                    event.stopPropagation(); // если зумер полностью загружен при наведении на кнопки постер не убираем
                } else {
                    ctx.mouse_in = false;
                    ctx.hideZoom(event);
                }
            });

            // стартуем зумер только если мы внутри постера
            jWin.bind('mouseenter.zoom_in', this, function(){
                $(document).bind('mousemove.zoom_out', function(event){
                    $(document).unbind('mousemove.zoom_out');
                    ctx.mouse_in = false;
                });
                ctx.mouse_in = true;
            });
            jWin.find('span').bind('mouseenter.zoom_in', this, function(){
                $(document).bind('mousemove.zoom_out', function(event){
                    $(document).unbind('mousemove.zoom_out');
                    ctx.mouse_in = false;
                });
                ctx.mouse_in = true;
            });


            jWin.bind('mouseenter.bounce', this, function (event) {
                $(document).bind('mousemove.hidezoom', function(event){
                    clearTimeout(ctx.showTimer); ctx.showTimer = 0;
                    $(document).unbind('mousemove.hidezoom');
                    ctx.hideZoom(event);
                });
                mx = event.pageX;
                my = event.pageY;

                if (ctx.showTrue) {
                    ctx.showZoom(event);
                } else {
                    if (!ctx.showTimer) {
                        ctx.showTimer = setTimeout(function () {
                            ctx.showZoom(event);
                        }, 1000);
                    }
                }
            });
            jWin.find('span').bind('mouseenter.bounce', this, function (event) {
                $(document).bind('mousemove.hidezoom', function(event){
                    clearTimeout(ctx.showTimer); ctx.showTimer = 0;
                    $(document).unbind('mousemove.hidezoom');
                    ctx.hideZoom(event);
                });
                mx = event.pageX;
                my = event.pageY;

                if (ctx.showTrue) {
                    ctx.showZoom(event);
                } else {
                    if (!ctx.showTimer) {
                        ctx.showTimer = setTimeout(function () {
                            ctx.showZoom(event);
                        }, 1000);
                    }
                }
            });
            jWin.bind('click.zoom', function(event){
                ctx.mouse_in = false;
                ctx.hideZoom(event);
            });
        };

        // запускаем весь механизм
        ctx.run();
    }

    // запуск линзы
    $.fn.CloudZoom = function (options) {
        if ($.cookie('mobile') == 'yes') {
            // отключаем для гостей
            return false;
        }
        // IE6 background image flicker fix
        try {
            document.execCommand("BackgroundImageCache", false, true);
        } catch (e) {}

        this.each(function () {
            var relOpts, opts;
            // настройки отображения хранящиеся у картинки
            if ($(this).attr('rel')) {
                eval('var a = {' + $(this).attr('rel') + '}');
                relOpts = a;
            }
            if ($(this).is('.cloud-zoom')) {
                // Wrap an outer div around the link so we can attach things without them becoming part of the link.
                // But not if wrap already exists.
                if ($(this).parent().attr('id') != 'wrap') {
                    $(this).wrap('<div id="wrap"></div>');
                }
                opts = $.extend({}, $.fn.CloudZoom.defaults, options);
                opts = $.extend({}, opts, relOpts);
                $(this).data('zoom', new CloudZoom($(this), opts));
            }
        });
        return this;
    };

    $.fn.CloudZoom.defaults = {
        zoomWidth: 'auto',
        zoomHeight: 'auto',
        position: 'right',
        tint: false,
        tintOpacity: 0.5,
        lensOpacity: 0.5,
        softFocus: false,
        smoothMove: 3,
        showTitle: true,
        titleOpacity: 0.5,
        adjustX: 0,
        adjustY: 0
    };

})(jQuery);