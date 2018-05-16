define([], function () {
   var contextMenus = {};

    /**
     * Default chrome extension way to add item to context menu
     * @param {Object} menuItem
     */
   contextMenus.addMenuItem = function (menuItem) {
       chrome.contextMenus.create(menuItem);
   };

    /**
     * 1. Transforms object to array
     * 2. Walking through array and adding items to context menu
     * @param {Object} menusObject
     */
   contextMenus.addMultipleItems = function (menusObject) {
       var array = Object.values(menusObject);
       array.forEach(function (t) {
           this.addMenuItem(t)
       }.bind(this))
   };

   return contextMenus;
});