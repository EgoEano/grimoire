    interceptionBypass: function () {
        // Обход перехвата submit от BlanksMgr
        // Отслеживание исчезновения формы после нажатия submit
        var self = this;
        var sbmtBtn = null;
        document.addEventListener("click", checkSubmitFormsForpageIds);

        function checkSubmitFormsForpageIds(event) {
            var elem = event.target;
            if (elem.type === "submit") {
                var ids = ["frmBlankRegistraction", "par_Blank_DoAction"];
                var frm = elem.closest("form");
                if (frm && ids.includes(frm.id)) {
                    sbmtBtn = frm;
                } else {
                    sbmtBtn = null;
                } 
            } else {
                sbmtBtn = null;
            }
        }

        function hasNodeTagType(node, tag) {
            if (node.tagName === tag) { return node; }
            for (var childNode of node.childNodes) {
                var res = hasNodeTagType(childNode, tag);
                if (res) { return res; }
            }
            return false;
        };

        var target = document.querySelector("body");
        var config = {
            attributes: true,
            childList: true,
            subtree: true,
        };
        var callback = function (mutationsList, observer) {
            for (var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (var removedNode of mutation.removedNodes) {
                        var typeNode = hasNodeTagType(removedNode, 'FORM');
                        if (typeNode && typeNode.id && sbmtBtn && sbmtBtn.id && typeNode.id === sbmtBtn.id) {
                            //Вызов на обновление таблицы
                            self.blanksGrid.dataRefresher();
                        }
                    }
                }
            }
        };

        var observer = new MutationObserver(callback);
        observer.observe(target, config);

    },
