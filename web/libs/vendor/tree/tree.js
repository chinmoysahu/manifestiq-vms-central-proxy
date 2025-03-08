(function ($) {
    function setCollapseIcon($element, remove, add) {
        return $element.find(".collapse-icon").removeClass(`fa-${remove}`).addClass(`fa-${add}`);
    }

    const Tree = {
        generate: function (container, data, options = {}) {
            const { openNodes = {} } = options; // Multi-level object to determine opened nodes
            const $tree = $("<ul>").addClass("tree");
            function buildTree(node, $parent, openNodeObj) {
                for (const key in node) {
                    const value = node[key];
                    const isStaticIcon =
                        value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
                    const isObjectValue = typeof value === "object" && value !== null;
                    const isCallback = typeof value === "function";
                    let collapseIcon = "plus";
                    const $li = $(`<li class="${isObjectValue && value._liClass ? value._liClass : ''}">`);
                    switch (true) {
                        case options.hiddenIcon:
                            collapseIcon = " d-none";
                            break;
                        case isStaticIcon:
                            collapseIcon = "square-o";
                            break;
                        case isCallback:
                            collapseIcon = "arrow-right";
                            break;
                    }
                    const $span = $("<span>")
                        .addClass("toggle")
                        .html(
                            `<i class="collapse-icon fa fa-${collapseIcon} mr-2"></i>${key}`
                        );
                    $li.append($span);

                    if (isObjectValue) {
                        delete(value._liClass)
                        const $childUl = $("<ul>")
                            .hide() // Hide child nodes by default
                            .addClass(key); // Add class for potential use
                        buildTree(value, $childUl, openNodeObj[key] || {});

                        // Check if this node should start opened
                        if (openNodeObj && openNodeObj.hasOwnProperty(key)) {
                            $childUl.show();
                        }

                        $li.append($childUl);
                    } else if (isCallback) {
                        // Add a callback for leaf nodes
                        $span.on("click", value).css("cursor", "pointer");
                    } else if (value === null) {
                        // Null node handling (no additional behavior for now)
                    } else {
                        $span.append(` : ${value}`);
                    }
                    $parent.append($li);
                }
            }
            buildTree(data, $tree, openNodes);
            $(container).empty().append($tree);
        },
        show: function ($element) {
            $element.show();
        },
        hide: function ($element) {
            $element.hide();
        },
        destroy: function (container) {
            $(container).empty();
        }
    };

    window.Tree = Tree;
    $('body').on("click", ".tree .toggle", function (e) {
        const $this = $(this);
        const $childUl = $this.next("ul");
        if (!$childUl.length) return;
        if ($childUl.is(":visible")) {
            setCollapseIcon($this, "minus", "plus");
            Tree.hide($childUl);
        } else {
            setCollapseIcon($this, "plus", "minus");
            Tree.show($childUl);
        }
        e.stopPropagation();
    });
})(jQuery);
