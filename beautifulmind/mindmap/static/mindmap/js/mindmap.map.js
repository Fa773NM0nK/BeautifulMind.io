/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

;
(function ($, window, document, undefined) {
    var version = '0.1',
        defaults = {
            component_spacing:{left:40, top:15},
            topbar_height:40 + 5 // height + 5 px spacing
        };

    function MindMap(element, options) {
        var self = this;

        self.element = $(element);

        // add reverse
        self.element.data('mindmapMap', self);

        self.options = $.extend({}, defaults, options);
        self.pk = self.element.data('map-pk');
        self._defaults = defaults;
        jsPlumb.ready(function () {
            self.init();
        });
    }

    MindMap.prototype.init = function () {
        var self = this;

        // load initial components
        $.ajax({
            url:self.element.data('components-url'),
            type:'POST',
            data:{},
            cache:false,
            success:function (data) {
                $($.parseJSON(data)).each(function () {
                    data = this;
                    // merge data.fields into data
                    for (var attrname in data.fields) {
                        data[attrname] = data.fields[attrname];
                    }
                    data.fields = undefined;
                    data.parent_pk = data.parent;
                    self.addComponent(data);
                });
            },
            error:function () {

            }
        });
    };

    MindMap.prototype.addComponent = function (data) {
        var self = this;

        var component = $.mindmapMapComponent({
            pk:data.pk,
            container:self.element,
            title:data.title,
            left:data.pos_left,
            top:data.pos_top,
            parent_pk:data.parent_pk,
            level:data.level
        });

        // set focus on title input
        if (data.set_focus_on_title_field) {
            $('.component-title:first', component.element).focus();
        }

        if (data.do_collide_check) {
            var parent_component = component.element.data('mindmapMapComponent').getParent();
            var parent_component_pos = parent_component.position();
            var component_pos = component.element.position();
            var offset = {left:0, top:component_pos.top};
            var fill_space_on_top = true;

            while (true) {
                if (data.type == 'child') { // child
                    component.element.css({
                        left:parent_component.left,
                        top:offset.top
                    });

                    // check if component overlaps navbar, if so fill space on bottom of parent
                    var overlaps_navbar = component.element.position().top - self.options.topbar_height < 0;
                    if (overlaps_navbar) {
                        fill_space_on_top = false;
                        offset.top = parent_component_pos.top;
                        continue;
                    }

                    var colliders = component.collidesWith();
                    var collider = $(colliders[0]);
                    if (colliders.length > 0 || overlaps_navbar) {
                        if (fill_space_on_top)
                            offset.top = collider.position().top - collider.outerHeight() - self.options.component_spacing.top
                        else
                            offset.top = collider.position().top + collider.outerHeight() + self.options.component_spacing.top

                    } else {
                        break;
                    }

                } else { // sibling
                    component.element.css({
                        left:parent_component_pos.left + parent_component.outerWidth() + self.options.component_spacing.left + offset.left,
                        top:offset.top
                    });

                    // check if component overlaps navbar, if so fill space on bottom of parent
                    var overlaps_navbar = component.element.position().top - self.options.topbar_height < 0;
                    if (overlaps_navbar) {
                        fill_space_on_top = false;
                        offset.top = parent_component_pos.top;
                        continue;
                    }

                    var colliders = component.collidesWith();
                    var collider = $(colliders[0]);
                    if (colliders.length > 0 || overlaps_navbar) {
                        if (fill_space_on_top)
                            offset.top = collider.position().top - collider.outerHeight() - self.options.component_spacing.top
                        else
                            offset.top = collider.position().top + collider.outerHeight() + self.options.component_spacing.top

                    } else {
                        break;
                    }
                }
            }
        }

        if (data.save) {
            var pos = component.element.position();
            var url = bm_globals.mindmap.map_component_add.replace('#1#', self.pk).replace('#2#', 'json');
            $.ajax({
                url:url,
                type:'POST',
                dataType:'json',
                data:{
                    title:data.title,
                    pos_left:pos.left,
                    pos_top:pos.top,
                    parent:data.parent_pk
                },
                cache:false,
                success:function (response_data) {
                    $.scrollTo(component.element, {offset: {left:0, top:self.options.topbar_height}});

                    // animate
                    var bg_color_origin = component.element.css('background-color');
                    component.element.css('background-color', '#4183c4');
                    component.element.animate({'background-color': bg_color_origin}, 1000);

                    component.setId(response_data.form.instance_pk);
                    component.addConnector();

                    $.mindmapSockjs.send('add_component', {
                        map_pk:self.pk,
                        title:data.title,
                        component_pk:response_data.form.instance_pk,
                        pos_left:pos.left,
                        pos_top:pos.top,
                        parent_pk:data.parent_pk
                    });
                },
                error:function () {
                    component.element.remove();
                }
            });
        } else {
            // animate
            var bg_color_origin = component.element.css('background-color');
            component.element.css('background-color', '#4183c4');
            component.element.animate({'background-color': bg_color_origin}, 1000);
            component.addConnector();
        }

        return component;
    };

    $.fn.mindmapMap = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_mindmapMap')) {
                $.data(this, 'plugin_mindmapMap',
                    new MindMap(this, options));
            }
        });
    }

})(jQuery, window, document);