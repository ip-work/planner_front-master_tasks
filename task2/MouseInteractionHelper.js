R2D.MouseInteractionHelper = function(commonSceneObject, commonSceneHelper, apiDispatcher) {
    EventDispatcher.call(this);

    var scope = this;
    scope.api = apiDispatcher;
    scope._scene = commonSceneObject.scene;
    scope._constructor = scope._scene.constructor;
    scope._history = scope._scene.history;
    scope._scene3d = commonSceneObject.scene3d;
    scope._productHelper = commonSceneHelper.productHelper;
    scope._constructorHelper = commonSceneHelper.constructorHelper;
    scope._commonSceneObject = commonSceneObject;
    scope._object3DMoving = commonSceneObject.moving;
    scope._mouseController = new R2D.MouseController();
    scope._touchController = new R2D.TouchController();
    //scope._quickPanelHelper = new R2D.QuickPanelHelper(scope);

    scope._snap2d = new SNAP.Snap2D();
    scope._ruler3d = scope._scene3d.ruler3d;
    scope._customRulers = scope._scene3d.customRulers;
    scope._titlesTool = scope._scene3d.titlesTool;
    scope._materialPreviewDrag = new R2D.MaterialDragPreview();
    scope._currentCamera = null;
    scope._currentCanvas = null;
    scope._currentViewer = null;
    scope._currentTools = null;

    var objectSelection = true;
    var constructorSelection = true;

    scope._scene.addEventListener(R2D.Scene.SCENE_CLEARED, sceneClearedListener);
    scope._scene.addEventListener(R2D.Scene.CURRENT_OBJECT_REMOVED, currentObjRemovedListener);
    scope._scene.addEventListener(R2D.Scene.CURRENT_OBJECT_REPLACED, currentObjReplacedListener);

    function sceneClearedListener()
    {
        //scope._quickPanelHelper.hideQuickPanel();
        scope._ruler3d.clear();

        scope.changeState(scope.stateMain);

        if ( page )
        {
            page.disable();
            page.removeEventListener(Event.UPDATE, productPageUpdateEvent);
            page.removeEventListener(Event.CHANGE, productPageChangeEvent);
            page.removeEventListener(Event.CHANGE_FINISH, productPageChangeFinishEvent);

            if ( page.inHistory() ) {
                R2D.rightPanel.removePage(page);
            }
        }
    }

    function productPageUpdateEvent(event) {
        if (scope._scene.currentView3DObject)
        {
            switch ( scope._scene.currentView3DObject.objectType )
            {
                case "product":
                    //updateBoxSelected(scene.currentView3DObject);
                    break;

                case "constructor":
                    //-
                    break;
            }
        }
        else if (scope._scene.currentGroup)
        {

        }

        scope._currentViewer.rendererUpdate();
        scope._scene.history.saveState();
    }
    function productPageChangeEvent(event) {
        switch (scope._scene.currentView3DObject.objectType ) {
            case "product":
                scope._ruler3d.findRules(scope._scene.currentView3DObject);
                break;

            case "constructor":
                scope._titlesTool.updateValues();
                //-
                break;
        }
    }
    function productPageChangeFinishEvent(event) {
        switch (scope._scene.currentView3DObject.objectType ) {
            case "product":
                if (scope._scene.currentView3DObject.type == R2D.ProductType.MODEL && scope._scene.currentView3DObject.getForWall() ) {
                    scope._constructor.pickElement(scope._scene.currentView3DObject.sceneObject.objectId);
                    scope._constructor.dropElement(R2D.Scene.getObjectDataForWallElement(scope._scene.currentView3DObject.sceneObject), 10);
                }

                //updateBoxSelected(scene.currentView3DObject);
                scope._ruler3d.update();
                scope._ruler3d.appendFromConstructor(scope._constructor.getLines());
                scope._ruler3d.findRules(scope._scene.currentView3DObject);
                break;

            case "constructor":
                //-
                break;
        }

        scope._currentViewer.rendererUpdate();
        scope._scene.history.saveState('productSizes');
    }

    function currentSceneObjectUpdateEvent(event) {
        //updateBoxSelected(scene.currentView3DObject);
        scope._currentViewer.rendererUpdate();
    }
    function productHelperUpdateEvent(event) {
        scope._currentViewer.rendererUpdate();
    }
    function constructorHelperUpdateEvent(event) {
        scope._currentViewer.rendererUpdate();
    }
    var page = null;
    function hidePage(view3DObject) {
        return;
        if (! view3DObject) return;
        var page = null;

        switch ( view3DObject.objectType ) {

            case "group":
                page = R2D.RightPanel.PageGroupSetting.getPage(view3DObject);
                break;

            case "product":
                page = R2D.RightPanel.PageProductSetting.getPage(view3DObject.sceneObject);
                break;

            case "constructor":

                switch ( view3DObject.type ) {
                    case 'wall':
                        page = R2D.RightPanel.PageConstructionElementWall.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                    case 'cover':
                        page = R2D.RightPanel.PageConstructionElementCover.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                    case 'topPlinth':
                    case 'bottomPlinth':
                        page = R2D.RightPanel.PageConstructionElementPlinth.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                    default:
                        page = R2D.RightPanel.PageConstructionElement.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                }
        }

        if ( page ) {
            page.disable();
            page.removeEventListener(Event.UPDATE, productPageUpdateEvent);
            page.removeEventListener(Event.CHANGE, productPageChangeEvent);
            page.removeEventListener(Event.CHANGE_FINISH, productPageChangeFinishEvent);

            if ( page.inHistory() ) {
                R2D.rightPanel.removePage(page);
            }
        }
    }

    scope.updateFreeSpace = function()
    {
        if (! page) return;
        if ((scope._scene.currentView3DObject && scope._scene.currentView3DObject.type == R2D.ProductType.MODEL)
            || scope._scene.currentGroup)
        {
            page.setFreeSpace(scope._ruler3d.distances);
        }
    };

    function showPage(view3DObject)
    {
        return;
        page = null;

        switch ( view3DObject.objectType ) {

            case "group":
                page = R2D.RightPanel.PageGroupSetting.getPage(view3DObject);
                scope.updateFreeSpace();
                //page.setFreeSpace(scope._ruler3d.distances);
                break;

            case "product":
                page = R2D.RightPanel.PageProductSetting.getPage(view3DObject.sceneObject);
                scope.updateFreeSpace();
                //page.setFreeSpace(scope._ruler3d.distances);
                break;

            case "constructor":

                switch ( view3DObject.type ) {
                    case 'wall':
                        page = R2D.RightPanel.PageConstructionElementWall.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                    case 'cover':
                        page = R2D.RightPanel.PageConstructionElementCover.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                    case 'topPlinth':
                    case 'bottomPlinth':
                        page = R2D.RightPanel.PageConstructionElementPlinth.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                    default:
                        page = R2D.RightPanel.PageConstructionElement.getPage(view3DObject.type, view3DObject.constructorElementData, scope._constructor);
                        break;
                }
        }

        if ( page ) {
            page.enable();
            page.addEventListener(Event.UPDATE, productPageUpdateEvent);
            page.addEventListener(Event.CHANGE, productPageChangeEvent);
            page.addEventListener(Event.CHANGE_FINISH, productPageChangeFinishEvent);

            if ( !page.inFocus() ) {
                R2D.rightPanel.addPage(page);
                if (page.update) page.update();
            }
        }
    }

    scope.updateSnap2d = function() {
        var i, l;
        var constructorLines = scope._constructor.getLines();
        var geomLines = new Array(constructorLines.length);
        var geomPoints = [];
        var geomBoxes = [];

        for ( i = 0, l = constructorLines.length; i < l; i++ ) {
            var cln = constructorLines[i];

            geomLines[i] = new GEOM.Line.make(cln.x1, cln.y1, cln.x2, cln.y2);

            geomPoints.push(new GEOM.Point(cln.x1, cln.y1));
            geomPoints.push(new GEOM.Point(cln.x2, cln.y2));
        }

        for ( i = 0, l = scope._productHelper.view3DObjects.length; i < l; i++ )
        {
            var viewObj = scope._productHelper.view3DObjects[i];
            if (viewObj == scope._scene.currentView3DObject || viewObj.group ||
                viewObj == scope.stateDraggingProdFromCatalog.view3DObject) continue;
    //            (scope._scene.currentGroup && scope._scene.currentGroup == scope._productHelper.view3DObjects[i].group)) continue;

            var sceneObject = scope._productHelper.view3DObjects[i].sceneObject;
            var rectPoints = GEOM.Point.rotatePoints(sceneObject.get2DRectPoints(), -GEOM.toRad(sceneObject.rotationY));
            var objectPoints = GEOM.Point.shiftPoints(new GEOM.Point(sceneObject.x, sceneObject.z), rectPoints);

            geomBoxes.push(new SNAP.Box(objectPoints, sceneObject.getHeight()));
            //geomPoints = geomPoints.concat(objectPoints);
        }

        for (i = 0; i < scope._scene.groups.length; i++)
        {
            var group = scope._scene.groups[i];
            if (group == scope._scene.currentGroup) continue;
            var pts = group.get2DRectPoints();
            pts = GEOM.Point.shiftPoints(new GEOM.Point(group.x, group.z), pts);
            geomBoxes.push(new SNAP.Box(pts, group.getHeight()));
        }

        geomPoints = GEOM.Point.getUniquePoints(geomPoints);

        scope._snap2d.updateDistance(15);
        scope._snap2d.updateLines(geomLines);
        scope._snap2d.updatePoints(geomPoints);
        scope._snap2d.updateBoxes(geomBoxes);
    };

    function currentObjRemovedListener()
    {
        if (scope._scene.currentGroup)
        {
            scope.removeCurrentGroup();
        }
        else
        {
            var tempSceneObject = scope._scene.currentView3DObject.sceneObject;
            scope.unsetActiveObjectProduct();
            scope._scene.remove(tempSceneObject);
            scope._scene.history.saveState();
            scope.changeState(scope.stateMain);
        }
    }

    function currentObjReplacedListener()
    {
        scope.unsetActiveObjectProduct();
        scope.changeState(scope.stateMain);
    }

    scope.ungroupCurrentGroup = function()
    {
        var gr = scope._scene.currentGroup;
        if (! gr) return;
        scope.unsetActiveGroup();
        gr.clear();

        scope._productHelper.removeGroup(gr);
        //scope._quickPanelHelper.hideQuickPanel();

        scope._scene.history.saveState();
        scope.changeState(scope.stateMain);
    };

    scope.mergeCurrentGroup = function()
    {
        var gr = scope._scene.currentGroup;
        if (! gr) return;

        gr.merged = true;
        scope._scene.history.saveState();
    };

    scope.removeCurrentGroup = function()
    {
        var gr = scope._scene.currentGroup;
        if (! gr) return;
        scope.unsetActiveGroup();
        var objViews = gr.getObjViews();
        gr.clear();
        for (var i = 0; i < objViews.length; i++) scope._scene.remove(objViews[i].sceneObject);
        scope._productHelper.removeGroup(gr);
        //scope._quickPanelHelper.hideQuickPanel();

        scope._scene.history.saveState();
        scope.changeState(scope.stateMain);
    };

    function viewerCameraPositionUpdateEvent(event) {
        scope._ruler3d.cameraPositionUpdate();
        scope._customRulers.viewUpdate();
        scope._titlesTool.viewUpdate();
    }

    function addRulerListener(event)
    {
        scope.unsetActiveObject();
        scope.unsetActiveGroup();
        scope.changeState(scope.stateCreatingRuler);
    }

    var downX = 0;
    var downY = 0;
    function mouseControllerEvent(event) {

        switch ( event.data.type ) {
            case R2D.MouseController.ROTATE:
                scope._currentViewer.cameraRotate(event.data.dx, event.data.dy);
                break;

            case R2D.MouseController.MOVE:
                scope._currentViewer.cameraMove(event.data.dx, event.data.dy);
                break;

            case R2D.MouseController.ZOOM:
                scope._currentViewer.cameraZoom(event.data.delta);
                break;

            case R2D.MouseController.START_MOVE:
                //scope._currentViewer.setCursorGrabbing();
                break;

            case R2D.MouseController.END_MOVE:
                //scope._currentViewer.setCursorDefault();
                break;

            case R2D.MouseController.START_ROTATE:
                scope._currentViewer.hideCursor();
                downX = event.data.x;
                downY = event.data.y;
                break;

            case R2D.MouseController.END_ROTATE:
                scope._currentViewer.showCursor();
                break;
        }
    }

    function historyEvent(event) {
        switch ( event.type ) {
            case R2D.SceneHistory.STATE_UPDATE:
                scope.unsetActiveObject();
                scope.unsetActiveGroup();
                break;

            case R2D.SceneHistory.STATE_UPDATED:
                break;
        }
    }

    scope.setSize = function(w, h) {
        scope._ruler3d.setSize(w, h);
        scope._customRulers.setSize(w, h);
        scope._titlesTool.setSize(w, h);
    };
    scope.updateComponents = function(camera, canvas, viewer, tools)
    {
        scope.unsetActiveObject();
        scope.unsetActiveGroup();
        if (scope.state != scope.stateMain) scope.changeState(scope.stateMain);

        if ( scope._currentCanvas ) {
            R2D.MEC.remove(scope._currentCanvas, scope._currentCanvas, R2D.MEC.LEFT_MOUSE_DOWN, leftMouseDownListener);
            R2D.MEC.remove(window, window, R2D.MEC.MOUSE_MOVE, leftMouseMoveListener);
            R2D.MEC.remove(window, window, R2D.MEC.LEFT_MOUSE_UP, leftMouseUpListener);

            R2D.MEC.remove(scope._currentCanvas, scope._currentCanvas, R2D.MEC.TOUCH_DOWN, touchDownListener);
            R2D.MEC.remove(window, window, R2D.MEC.TOUCH_MOVE, touchMoveListener);
            R2D.MEC.remove(window, window, R2D.MEC.TOUCH_UP, touchUpListener);
        }
        if ( scope._currentViewer ) {
            scope._currentViewer.removeEventListener(R2D.Viewer.CAMERA_POSITION_UPDATE, viewerCameraPositionUpdateEvent);
            scope._currentViewer.removeEventListener(R2D.Viewer.ADD_RULER, addRulerListener);
        }

        scope._currentCamera = camera;
        scope._currentCanvas = canvas;
        scope._currentViewer = viewer;
        scope._currentTools = tools;

        scope._mouseController.updateComponents(scope._currentCanvas);
        scope._touchController.updateComponents(scope._currentCanvas);
        scope._ruler3d.updateComponents(camera, tools);
        scope._customRulers.updateComponents(camera, tools, scope._currentCanvas, scope._currentViewer);
        scope._titlesTool.updateComponents(camera, tools, scope._currentCanvas, scope._currentViewer);

        if ( scope._currentCanvas )
        {
            R2D.MEC.add(scope._currentCanvas, scope._currentCanvas, R2D.MEC.LEFT_MOUSE_DOWN, leftMouseDownListener);
            R2D.MEC.add(window, window, R2D.MEC.MOUSE_MOVE, leftMouseMoveListener);
            R2D.MEC.add(window, window, R2D.MEC.LEFT_MOUSE_UP, leftMouseUpListener);

            R2D.MEC.add(scope._currentCanvas, scope._currentCanvas, R2D.MEC.TOUCH_DOWN, touchDownListener);
            R2D.MEC.add(window, window, R2D.MEC.TOUCH_MOVE, touchMoveListener);
            R2D.MEC.add(window, window, R2D.MEC.TOUCH_UP, touchUpListener);
        }
        if ( scope._currentViewer )
        {
            scope._currentViewer.addEventListener(R2D.Viewer.CAMERA_POSITION_UPDATE, viewerCameraPositionUpdateEvent);
            scope._currentViewer.addEventListener(R2D.Viewer.ADD_RULER, addRulerListener);
        } else {
            scope._currentViewer = {
                rendererUpdate() { /*console.warn("Handle update event!")*/},
                removeEventListener() { }
            };
        }
    };
    scope.objectSelection = function (value) {
        objectSelection = value;
    };

    scope.constructorSelection = function (value) {
        constructorSelection = value;
    };

    scope._scene.addEventListener(R2D.Scene.DRAG_OBJECT, sceneObjectDragListener);
    scope._history.addEventListener(R2D.SceneHistory.STATE_UPDATE, historyEvent);

    scope._productHelper.addEventListener(Event.UPDATE, productHelperUpdateEvent);
    scope._constructorHelper.addEventListener(Event.UPDATE, constructorHelperUpdateEvent);
    scope._mouseController.addEventListener(Event.UPDATE, mouseControllerEvent);
    scope._touchController.addEventListener(Event.UPDATE, mouseControllerEvent);


    scope._constructor.addEventListener(WC.ASK_ELEMENT_NAME, askNameListener);
    function askNameListener()
    {
        //windowAskName.setValue();
    }

    // ----------------------------------------------------

    scope.mouseX = 0;
    scope.mouseY = 0;
    var vectorsForMatMove = null;
    //scope.clickX = 0;
    //scope.clickY = 0;

    scope.stateMain = new R2D.MIH.StateMain(scope);
    scope.stateSelectedProduct = new R2D.MIH.StateSelectedProduct(scope);
    scope.stateSelectedConstr = new R2D.MIH.StateSelectedConstr(scope);
    scope.stateDraggingProduct = new R2D.MIH.StateDraggingProduct(scope);
    scope.stateDraggingMaterial = new R2D.MIH.StateDraggingMaterial(scope);
    scope.stateDraggingProdFromCatalog = new R2D.MIH.StateDraggingProdFromCatalog(scope);
    scope.stateCreatingRuler = new R2D.MIH.StateCreatingRuler(scope);
    scope.stateSelectedGroup = new R2D.MIH.StateSelectedGroup(scope);
    scope.stateDraggingGroup = new R2D.MIH.StateDraggingGroup(scope);

    scope.state = scope.stateMain;

    function leftMouseDownListener(e)
    {
        scope.state.mouseDown(e);
    }

    function leftMouseMoveListener(e)
    {
        scope.mouseX = e.clientX;
        scope.mouseY = e.clientY;
        scope.state.mouseMove(e);
    }

    function leftMouseUpListener(e)
    {
        scope.state.mouseUp(e);
    }

    function touchDownListener(e)
    {
        scope.state.mouseDown(e);
    }

    function touchMoveListener(e)
    {
        scope.mouseX = e.clientX;
        scope.mouseY = e.clientY;
        scope.state.mouseMove(e);
    }

    function touchUpListener(e)
    {
        scope.state.mouseUp(e);
    }


    scope.draggingMaterialId = '';
    function sceneObjectDragListener(event) {
        //if (R2D.scene3d.customRulers.isCreating()) R2D.scene3d.customRulers.cancel();

        if ( event.data.type == R2D.ProductType.MATERIAL ) {
            scope._materialPreviewDrag.setPosition(-1000, -1000);
            scope._materialPreviewDrag.updatePreview(event.data.productId);
            scope._currentTools.appendChild(scope._materialPreviewDrag.domElement);
            scope.draggingMaterialId = event.data.productId;


            scope.stateDraggingMaterial.prevState = scope.state;
            scope.changeState(scope.stateDraggingMaterial);
        }
        else
        {
            //var boxView3DObject = new R2D.ObjectViewer3DBox(event.data);
            var sceneObj = event.data;
            scope._scene.add(sceneObj);
            var view3DObj = scope._productHelper.findObjectView3dBySceneObject(sceneObj);

            let sceneCenter = scope._scene.getBounds();

            scope._object3DMoving.position.set(
                sceneCenter.centerX,
                view3DObj.sceneObject.y + view3DObj.sceneObject.height / 2,
                sceneCenter.centerY
            );
            scope._object3DMoving.scale.set(1.5, 1, 1.5);

            scope.stateDraggingProdFromCatalog.view3DObject = view3DObj;
            scope.changeState(scope.stateDraggingProdFromCatalog);

            scope._ruler3d.update();
            scope._ruler3d.appendFromConstructor(scope._constructor.getLines());
            scope._ruler3d.findRules(view3DObj);
            scope._currentViewer.rendererUpdate();
        }
    }

    scope.changeState = function(state)
    {
        var oldState = scope.state;
        scope.state.stop();
        scope.state = state;
        scope.state.start();

        scope._currentViewer.rendererUpdate();

        var evt = new Event(R2D.MouseInteractionHelper.STATE_CHANGED);
        evt.oldState = oldState;
        evt.newState = state;
        scope.dispatchEvent(evt);
    };

    //

    scope.find3DObject = function(mx, my)
    {
        var point = R2D.Renderer3D.getMousePointForPicker(scope._currentCanvas, mx, my);
        var objectData = null;
        if (constructorSelection)
        {
            objectData = scope._scene3d.objectUnderCursor(commonSceneObject.interactiveObjects, scope._currentCamera, point.x, point.y);
        }
        else
        {
            objectData = scope._scene3d.objectUnderCursor(commonSceneObject.productObjects, scope._currentCamera, point.x, point.y);
        }
        var view3DObject = objectData ? scope._productHelper.findObjectView3DByObject3D(objectData.object) || scope._constructorHelper.findObjectView3DByObject3D(objectData.object) : null;

        if ( view3DObject ) {
            var partNum = null;
            if (typeof objectData.object.num !== 'undefined') partNum = objectData.object.num;
            return {
                point: objectData.point,
                distance: objectData.distance,
                view3DObject: view3DObject,
                partNum: partNum
            }
        }

        return null;
    };

    scope.setActiveGroup = function(group, mx, my, showQPanel = true)
    {
        scope._scene.currentGroup = group;
        //if (showQPanel) scope._quickPanelHelper.showQuickPanel(group, mx, my);

        scope._ruler3d.update();
        scope._ruler3d.appendFromConstructor(scope._constructor.getLines());
        scope._ruler3d.findRules(scope._scene.currentGroup);

        showPage(scope._scene.currentGroup);

        //scope.clickX = mx;
        //scope.clickY = my;
        scope.api.dispatchEvent(new Event(scope.api.STATE_SELECTED_GROUP, {pos: {x: mx, y: my}}));
    };

    scope.unsetActiveGroup = function()
    {
        if (! scope._scene.currentGroup) return;

        hidePage(scope._scene.currentGroup);
        scope._scene.currentGroup = null;
        scope._ruler3d.clear();
        //scope._quickPanelHelper.hideQuickPanel();

        if (scope.state == scope.stateSelectedGroup || scope.state == scope.stateDraggingGroup)
        {
            scope.changeState(scope.stateMain);
        }

        scope.api.dispatchEvent(new Event(scope.api.STATE_MAIN, {}));
    };

    scope.setActiveObjectProduct = function(view3DObject, mx, my, showQPanel = true)
    {
        scope._scene.currentView3DObject = view3DObject;
        scope._scene.currentSceneObject = scope._scene.currentView3DObject.sceneObject;

        scope._scene.currentSceneObject.addEventListener(Event.UPDATE, currentSceneObjectUpdateEvent);
        scope._currentViewer.selectedObject(scope._scene.currentView3DObject);
        scope._ruler3d.update();
        scope._ruler3d.appendFromConstructor(scope._constructor.getLines());
        scope._ruler3d.findRules(scope._scene.currentView3DObject);

        //setView3DObject(scene.currentView3DObject);
        //showPage(scope._scene.currentView3DObject);
        //if (showQPanel) scope._quickPanelHelper.showQuickPanel(scope._scene.currentView3DObject, mx, my);
        //scope.clickX = mx;
        //scope.clickY = my;
        scope.api.dispatchEvent(new Event(scope.api.STATE_SELECTED_MODEL, {pos: {x: mx, y: my}}));
    };

    scope.unsetActiveObjectProduct = function()
    {
        if (scope._scene.currentSceneObject)
        {
            scope._scene.currentSceneObject.removeEventListener(Event.UPDATE, currentSceneObjectUpdateEvent);
            hidePage(scope._scene.currentView3DObject);
        }

        scope._currentViewer.unselectedObject(scope._scene.currentView3DObject);
        scope._ruler3d.clear();
        //scope._quickPanelHelper.hideQuickPanel();

        scope._scene.currentView3DObject = null;
        scope._scene.currentSceneObject = null;
        //scope._scene.currentGroup = null;

        scope._scene.history.setCurrentLabel('');

        scope.api.dispatchEvent(new Event(scope.api.STATE_MAIN, {}));
    };

    scope.setActiveObjectConstructor = function(view3DObject, mx, my, objectData, showQuickPanel=true)
    {
        scope._scene.currentView3DObject = view3DObject;
        scope._scene.currentPartNum = objectData ? objectData.partNum : null;
        scope._scene.currentConstructorElementData = view3DObject.constructorElementData;

        //showPage(scope._scene.currentView3DObject);

        if (showQuickPanel)
        {
            var objectDataX = scope.find3DObject(mx + 1, my);
            var objectDataY = scope.find3DObject(mx, my + 1);
            if (objectDataX && objectDataY)
            {
                vectorsForMatMove = [objectData.point, objectDataX.point, objectDataY.point];
            }

            //scope._quickPanelHelper.showQuickPanel(scope._scene.currentView3DObject, mx, my, objectData.partNum, vectors);
        }
        else
        {
        //    scope._quickPanelHelper.hideQuickPanel();
        }

        //currentViewer.rendererUpdate();
        //scope.clickX = mx;
        //scope.clickY = my;
        scope.api.dispatchEvent(new Event(scope.api.STATE_SELECTED_CONSTR, {pos: {x: mx, y: my}}));
    };

    scope.unsetActiveObjectConstructor = function()
    {
        hidePage(scope._scene.currentView3DObject);
        //scope._quickPanelHelper.hideQuickPanel();

        scope._scene.currentView3DObject = null;
        scope._scene.currentConstructorElementData = null;

        scope.api.dispatchEvent(new Event(scope.api.STATE_MAIN, {}));
    };

    scope.unsetActiveObject = function()
    {
        if (! scope._scene.currentView3DObject) return;

        if (scope.state == scope.stateSelectedProduct || scope.state == scope.stateDraggingProduct)
        {
            scope.unsetActiveObjectProduct();
            scope.changeState(scope.stateMain);
        }

        if (scope.state == scope.stateSelectedConstr)
        {
            scope.unsetActiveObjectConstructor();
            scope.changeState(scope.stateMain);
        }
    };
    scope.cancelCreatingRuler = function()
    {
        if (scope.state == scope.stateCreatingRuler) scope.changeState(scope.stateMain);
    };
    /*
    scope.tryAddToGroup = function(view3DObj)
    {
        if (view3DObj.group) return; // merge groups?
        if (scope._scene.currentGroup)
        {
            scope._productHelper.addObjToGroup(view3DObj);
        }
        else if (scope._scene.currentView3DObject && view3DObj != scope._scene.currentView3DObject)
        {
            scope._scene.currentGroup = scope._productHelper.addGroup();
            scope._productHelper.addObjToGroup(scope._scene.currentView3DObject);
            scope._productHelper.addObjToGroup(view3DObj);
        }
    }
    */

    // actions from quick panel

    scope.clearFill = function()
    {
        scope._scene.currentView3DObject.clearMaterial();
        scope._scene.currentView3DObject.update();
        scope._scene.history.saveState();
    };

    scope.duplicateCurrentModel = function()
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject.clone();

        if ( scope._scene.currentView3DObject.getForWall() )
        {
            var pointA = GEOM.Point.rotatePoint(new GEOM.Point( sceneObject.getWidth(), 0), -GEOM.toRad(sceneObject.rotationY));
            var pointB = GEOM.Point.rotatePoint(new GEOM.Point(-sceneObject.getWidth(), 0), -GEOM.toRad(sceneObject.rotationY));

            pointA.x += sceneObject.x;
            pointA.y += sceneObject.z;
            pointB.x += sceneObject.x;
            pointB.y += sceneObject.z;

            if (scope._constructor.moveElement({ x:pointA.x, y:pointA.y }, 20) ) {
                sceneObject.x = pointA.x;
                sceneObject.z = pointA.y;

                scope._scene.add(sceneObject);
            } else if ( scope._constructor.moveElement({ x:pointB.x, y:pointB.y }, 20) ) {
                sceneObject.x = pointB.x;
                sceneObject.z = pointB.y;

                scope._scene.add(sceneObject);
            }
        }
        else
        {
            if (isNaN(scope._ruler3d.distances[1]) || scope._ruler3d.distances[1] >= sceneObject.getWidth())
            {
                pointA = GEOM.Point.rotatePoint(new GEOM.Point( sceneObject.getWidth(), 0), -GEOM.toRad(sceneObject.rotationY));
            }
            else if (isNaN(scope._ruler3d.distances[3]) || scope._ruler3d.distances[3] >= sceneObject.getWidth())
            {
                pointA = GEOM.Point.rotatePoint(new GEOM.Point(-sceneObject.getWidth(), 0), -GEOM.toRad(sceneObject.rotationY));
            }
            else if (isNaN(scope._ruler3d.distances[2]) || scope._ruler3d.distances[2] >= sceneObject.getWidth())
            {
                pointA = GEOM.Point.rotatePoint(new GEOM.Point(0, sceneObject.getDepth()), -GEOM.toRad(sceneObject.rotationY));
            }
            else if (isNaN(scope._ruler3d.distances[0]) || scope._ruler3d.distances[0] >= sceneObject.getWidth())
            {
                pointA = GEOM.Point.rotatePoint(new GEOM.Point(0, -sceneObject.getDepth()), -GEOM.toRad(sceneObject.rotationY));
            }
            else
            {
                pointA = GEOM.Point.rotatePoint(new GEOM.Point( sceneObject.getWidth(), 0), -GEOM.toRad(sceneObject.rotationY));
            }

            pointA.x += sceneObject.x;
            pointA.y += sceneObject.z;

            sceneObject.x = pointA.x;
            sceneObject.z = pointA.y;

            scope._scene.add(sceneObject);
        }

        scope._scene.history.saveState();

        scope._ruler3d.update(scope._productHelper.getView3DObjects(), scope._scene.currentView3DObject);
        scope._ruler3d.appendFromConstructor(scope._constructor.getLines());
        scope._ruler3d.findRules(scope._scene.currentView3DObject);
    };

    scope.duplicateCurrentGroup = function()
    {
        var newGroup = scope._productHelper.addGroup();
        newGroup.copyFrom(scope._scene.currentGroup);
        scope._scene.history.saveState();
    };

    scope.flipCurrentGroupX = function()
    {
        scope._scene.currentGroup.flipX();
        scope._scene.history.saveState();
        scope._currentViewer.rendererUpdate();
    };

    scope.flipCurrentGroupZ = function()
    {
        scope._scene.currentGroup.flipZ();
        scope._scene.history.saveState();
        scope._currentViewer.rendererUpdate();
    };

    scope.flipCurrentModelX = function()
    {
        scope._scene.currentView3DObject.sceneObject.flipX = !scope._scene.currentView3DObject.sceneObject.flipX;
        scope._scene.currentView3DObject.sceneObject.update();

        if (scope._scene.currentView3DObject.getForWall())
        {
            scope._constructor.pickElement(scope._scene.currentView3DObject.sceneObject.objectId);
            scope._constructor.dropElement(R2D.Scene.getObjectDataForWallElement(scope._scene.currentView3DObject.sceneObject), 10);
        }
        scope._scene.history.saveState();
    };

    scope.flipCurrentModelZ = function()
    {
        scope._scene.currentView3DObject.sceneObject.flipZ = !scope._scene.currentView3DObject.sceneObject.flipZ;
        scope._scene.currentView3DObject.sceneObject.update();

        if (scope._scene.currentView3DObject.getForWall())
        {
            scope._constructor.pickElement(scope._scene.currentView3DObject.sceneObject.objectId);
            scope._constructor.dropElement(R2D.Scene.getObjectDataForWallElement(scope._scene.currentView3DObject.sceneObject), 10);
        }
        scope._scene.history.saveState();
    };

    var startR;
    scope.startRotateCurrentModel = function()
    {
        startR = scope._scene.currentView3DObject.sceneObject.rotationY;
    };
    scope.rotateCurrentModel = function(degrees)
    {
        scope._scene.currentView3DObject.sceneObject.rotationY = G.pacifyAngleDeg(degrees);
        scope._scene.currentView3DObject.sceneObject.update();
        scope._ruler3d.findRules(scope._scene.currentView3DObject);
    };
    scope.stopRotateCurrentModel = function()
    {
        scope._scene.history.saveState();
    };

    scope.startRotateCurrentGroup = function()
    {
        startR = scope._scene.currentGroup.rotation;
    };
    scope.rotateCurrentGroup = function(degrees)
    {
        scope._scene.currentGroup.setRotation(GEOM.toRad(degrees));
        scope._ruler3d.findRules(scope._scene.currentGroup);
        scope._currentViewer.rendererUpdate();
    };
    scope.stopRotateCurrentGroup = function()
    {
        scope._scene.history.saveState();
    };

    //

    var startE;
    scope.startElevateCurrentModel = function()
    {
        startE = scope._scene.currentView3DObject.sceneObject.y;
    };
    scope.elevateCurrentModel = function(height)
    {
        scope._scene.currentView3DObject.sceneObject.y = height;
        scope._scene.currentView3DObject.sceneObject.update();
    };
    scope.stopElevateCurrentModel = function()
    {
        scope._scene.history.saveState();
    };

    scope.startElevateCurrentGroup = function()
    {
        startE = scope._scene.currentGroup.y;
    };
    scope.elevateCurrentGroup = function(height)
    {
        scope._scene.currentGroup.y = height;
        scope._scene.currentGroup.update();
    };
    scope.stopElevateCurrentGroup = function()
    {
        scope._scene.history.saveState();
    };

    //

    scope.startRotateCurrentMaterial = function()
    {
        scope._scene.currentView3DObject.startRotateMaterial();
    };
    scope.rotateCurrentMaterial = function(degrees)
    {
        scope._scene.currentView3DObject.rotateMaterial(GEOM.toRad(degrees), scope._scene.currentPartNum);
        scope._scene.currentView3DObject.update();
    };
    scope.stopRotateCurrentMaterial = function()
    {
        scope._scene.currentView3DObject.stopRotateMaterial();
        scope._scene.currentView3DObject.update();
        scope._scene.history.saveState();
    };

    var shiftVectH = null;
    var shiftVectV = null;
    var pointDown = null;
    var pointPrev = null;
    var startShift = null;
    scope.startMoveCurrentMaterial = function()
    {
        if (vectorsForMatMove)
        {
            var vectors = vectorsForMatMove;
            if (scope._scene.currentView3DObject.type == 'wall' || scope._scene.currentView3DObject.type == 'cut' ||
                scope._scene.currentView3DObject.type == 'topFrame')
            {
                var x1 = TR.euclDist(vectors[0].x, vectors[0].z, vectors[1].x, vectors[1].z);
                var y1 = vectors[1].y - vectors[0].y;
                var x2 = TR.euclDist(vectors[0].x, vectors[0].z, vectors[2].x, vectors[2].z);
                var y2 = vectors[2].y - vectors[0].y;
                shiftVectH = new TR.Point(x1, y1);
                shiftVectV = new TR.Point(x2, y2);
            }
            else if (scope._scene.currentView3DObject.type == 'cover' || scope._scene.currentView3DObject.type == 'ceiling' ||
                scope._scene.currentView3DObject.type == 'area' || scope._scene.currentView3DObject.type == 'cap')
            {
                x1 = vectors[1].x - vectors[0].x;
                y1 = vectors[1].z - vectors[0].z;
                x2 = vectors[2].x - vectors[0].x;
                y2 = vectors[2].z - vectors[0].z;
                shiftVectH = new TR.Point(x1, y1);
                shiftVectV = new TR.Point(x2, y2);
            }
            else if (scope._scene.currentView3DObject.type == 'bottomFrame')
            {
                x1 = vectors[1].x - vectors[0].x;
                y1 = vectors[1].z - vectors[0].z;
                x2 = vectors[2].x - vectors[0].x;
                y2 = vectors[2].z - vectors[0].z;
                var data = scope._scene.currentView3DObject.constructorElementData;
                shiftVectH = new TR.Point(x1 * data.dirY.x + y1 * data.dirY.y, x1 * data.dirX.x + y1 * data.dirX.y);
                shiftVectV = new TR.Point(x2 * data.dirY.x + y2 * data.dirY.y, x2 * data.dirX.x + y2 * data.dirX.y);
            }
        }

        pointDown = {
            x:scope.mouseX,
            y:scope.mouseY
        };

        pointPrev = {
            x:scope.mouseX,
            y:scope.mouseY
        };

        startShift = scope._scene.currentView3DObject.getMaterialShift(scope._scene.currentPartNum);

        scope._scene.currentView3DObject.startMoveMaterial();
    };
    scope.moveCurrentMaterial = function(x, y)
    {
        var dx = scope.mouseX - pointPrev.x;
        var dy = scope.mouseY - pointPrev.y;

        var scrShiftX = scope.mouseX - pointDown.x;
        var scrShiftY = scope.mouseY - pointDown.y;

        var shiftX = scrShiftX * shiftVectH.x + scrShiftY * shiftVectV.x;
        var shiftY = scrShiftX * shiftVectH.y + scrShiftY * shiftVectV.y;

        pointPrev = {
            x: scope.mouseX,
            y: scope.mouseY
        };

        //scope.setX(scope.getX() + dx);
        //scope.setY(scope.getY() + dy);

        scope._scene.currentView3DObject.moveMaterial([startShift[0] + shiftX, startShift[1] + shiftY], scope._scene.currentPartNum);
        scope._scene.currentView3DObject.update();

        //scope._scene.currentView3DObject.moveMaterial([x, y], scope._scene.currentPartNum);
        //scope._scene.currentView3DObject.update();
    };
    scope.stopMoveCurrentMaterial = function()
    {
        pointDown = null;
        pointPrev = null;

        scope._scene.currentView3DObject.stopMoveMaterial();
        scope._scene.history.saveState();
    };

    scope.getAvailableTools = function()
    {
        var currentObj = scope._scene.currentView3DObject;
        var currentGroup = scope._scene.currentGroup;
        if (currentGroup)
        {
            return {
                flipX: true,
                flipZ: true,
                duplicate: true,
                remove: true,
                elevate: true,
                rotate: true,
                move: false
            };
        }
        else if (currentObj && currentObj.objectType == 'product')
        {
            switch (currentObj.type) {
                case R2D.ProductType.MODEL:
                    return {
                        flipX: true,
                        flipZ: true,
                        duplicate: true,
                        remove: true,
                        elevate: true,
                        rotate: ! currentObj.getForWall(),
                        move: false
                    };
                    break;

                case R2D.ProductType.CARPET:
                    return {
                        flipX: false,
                        flipZ: false,
                        duplicate: false,
                        remove: true,
                        elevate: true,
                        rotate: true,
                        move: false
                    };
                    break;

                case R2D.ProductType.POSTER:
                    return {
                        flipX: false,
                        flipZ: false,
                        duplicate: false,
                        remove: true,
                        elevate: true,
                        rotate: false,
                        move: false
                    };
                    break;
            }
        }
        else if (currentObj && currentObj.objectType == 'constructor')
        {
            var useMoving = !(currentObj.type == R2D.ObjectConstructor3DType.FRAME_TOP ||
            currentObj.type == R2D.ObjectConstructor3DType.PLINTH_TOP ||
            currentObj.type == R2D.ObjectConstructor3DType.PLINTH_BOTTOM);

            return {
                flipX: false,
                flipZ: false,
                duplicate: false,
                remove: true,
                elevate: false,
                rotate: true,
                move: useMoving
            };
        }
    };

    scope.getCurrentModelMaterials = function()
    {
        if (scope._scene.currentView3DObject)
        {
            var materials = scope._scene.currentView3DObject.sceneObject.getMaterials();
            var res = [];
            for (var mat of materials)
            {
                res.push({
                    matId: mat.current,
                    source: mat.source,
                    setId: mat.setId
                });
            }
            return res;
        }
    };

    scope.setMaterialOnCurrentModel = function(index, matId)
    {
        if (! scope._scene.currentView3DObject) return;
        scope._scene.currentView3DObject.sceneObject.setMaterialAt(index, matId);
        scope._scene.currentView3DObject.sceneObject.update();
        scope._scene.history.saveState();
    };

    scope.getCurrentConstrMaterial = function()
    {
        if (! scope._scene.currentView3DObject) return;
        return scope._scene.currentView3DObject.getConstructorElementData().getMaterial(scope._scene.currentPartNum);
    };

    scope.setMaterialOnCurrentConstr = function(matId)
    {
        if (! scope._scene.currentView3DObject) return;
        scope._scene.currentView3DObject.getConstructorElementData().setMaterial(matId, scope._scene.currentPartNum);
        scope._scene.currentView3DObject.getConstructorElementData().dispatchUpdate();
    };
    
     scope.addProductFromCatalog = function(id)                                /////////////////////////////////////////////////////////////////////
    {                                                                           /////////////////////////////////////////////////////////////////////
        var productsDataLoader;                                                 /////////////////////////////////////////////////////////////////////
        var productData = R2D.Pool.getProductData(id);                          /////////////////////////////////////////////////////////////////////
                                                                                /////////////////////////////////////////////////////////////////////
        if (productData)                                                        /////////////////////////////////////////////////////////////////////
        {                                                                       /////////////////////////////////////////////////////////////////////
            console.log('Already exists!');                                     /////////////////////////////////////////////////////////////////////
        }                                                                       /////////////////////////////////////////////////////////////////////
        else                                                                    /////////////////////////////////////////////////////////////////////
        {                                                                       /////////////////////////////////////////////////////////////////////
            productsDataLoader = new R2D.ProductsDataLoader();                  /////////////////////////////////////////////////////////////////////
            productsDataLoader.load([id]);                                      /////////////////////////////////////////////////////////////////////
            productData = R2D.Pool.getProductData(id);                          /////////////////////////////////////////////////////////////////////
            var sceneObject = R2D.Creator.makeSceneObject(productData);         /////////////////////////////////////////////////////////////////////
            R2D.Controller.addSceneObject(sceneObject);                         /////////////////////////////////////////////////////////////////////
        }                                                                       /////////////////////////////////////////////////////////////////////
    };                                                                          /////////////////////////////////////////////////////////////////////
    
    scope.dragProductFromCatalog = function(id)
    {
        var productsDataLoader;
        var productData = R2D.Pool.getProductData(id);

        if (productData)
        {
            console.log('Already exists!');
            var sceneObject = R2D.Creator.makeSceneObject(productData);
            R2D.Controller.dragSceneObject(sceneObject);
        }
        else
        {
            productsDataLoader = new R2D.ProductsDataLoader();
            productsDataLoader.addEventListener(Event.COMPLETE, productsDataLoaderEventHandler);
            productsDataLoader.load([id]);
        }

        function productsDataLoaderEventHandler(event) {
            if ( event.type == Event.COMPLETE )
            {
                productsDataLoader.removeEventListener(Event.COMPLETE, productsDataLoaderEventHandler);
                productsDataLoader.dispose();
                productsDataLoader = null;

                productData = R2D.Pool.getProductData(id);

                console.log('Loaded data!');
                var sceneObject = R2D.Creator.makeSceneObject(productData);
                R2D.controller.dragSceneObject(sceneObject);
            }
        }
    };

    scope.getCurrentModelSizes = function()
    {
        if (! scope._scene.currentView3DObject) return null;
        var sceneObj = scope._scene.currentView3DObject.sceneObject;

        return {
            width: sceneObj.getWidth(),
            height: sceneObj.getHeight(),
            depth: sceneObj.getDepth(),
            elevation: sceneObj.y
        };
    };

    scope.setCurrentModelWidth = function(vWidth, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var cWidth = sceneObject.getWidth();
        var ratio = vWidth / cWidth;

        if ( keepRatio ) {
            changeSizesByRatio(ratio);
        } else {
            sceneObject.setWidth(Math.round(cWidth * ratio * 10) / 10);
            sceneObject.update();
        }

        scope._ruler3d.findRules(scope._scene.currentView3DObject);
        scope._scene.history.saveState();
    };

    scope.setCurrentModelHeight = function(vHeight, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var cHeight = sceneObject.getHeight();

        var ratio = vHeight / cHeight;

        if ( keepRatio ) {
            changeSizesByRatio(ratio);
        } else {
            sceneObject.setHeight(Math.round(cHeight * ratio * 10) / 10);
            sceneObject.update();
        }

        scope._ruler3d.findRules(scope._scene.currentView3DObject);
        scope._scene.history.saveState();
    };

    scope.setCurrentModelDepth = function(vDepth, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var cDepth = sceneObject.getDepth();

        var ratio = vDepth / cDepth;

        if ( keepRatio ) {
            changeSizesByRatio(ratio);
        } else {
            sceneObject.setDepth(Math.round(cDepth * ratio * 10) / 10);
            sceneObject.update();
        }

        scope._ruler3d.findRules(scope._scene.currentView3DObject);
        scope._scene.history.saveState();
    };

    scope.setCurrentModelElevation = function(vElevation)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        sceneObject.y = vElevation;
        sceneObject.update();
        scope._scene.history.saveState();
    };

    function changeSizesByRatio(r)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var objType = sceneObject.getType();

        var width = sceneObject.getWidth();
        var height = sceneObject.getHeight();
        var depth = sceneObject.getDepth();

        if (objType == 2)
        {
            width *= r;
            height *= r;
            depth *= r;
        }
        else if (objType == 3)
        {
            width *= r;
            height *= r;
        }
        else if (objType == 4)
        {
            width *= r;
            depth *= r;
        }

        var min = Math.min(width, height, depth);
        var max = 0;
        var ratio = 1;

        if ( min == 0 ) {
            min = R2D.SceneObject.OBJECT_SIZE_MIN;
        }
        if ( min < R2D.SceneObject.OBJECT_SIZE_MIN ) {
            ratio = R2D.SceneObject.OBJECT_SIZE_MIN / min;

            width *= ratio;
            height *= ratio;
            depth *= ratio;
        }

        max = Math.max(width, height, depth);

        if ( max == 0 ) {
            max = R2D.SceneObject.OBJECT_SIZE_MAX;
        }

        sceneObject.setWidth(Math.round(width * 10) / 10);
        sceneObject.setDepth(Math.round(depth * 10) / 10);
        sceneObject.setHeight(Math.round(height * 10) / 10);
        sceneObject.update();
    }

    scope.changeCurrentModelWidth = function(val=1, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var cWidth = sceneObject.getWidth();
        var ratio = (cWidth + val) / cWidth;

        if ( keepRatio ) {
            changeSizesByRatio(ratio);
        } else {
            sceneObject.setWidth(Math.round(cWidth * ratio * 10) / 10);
            sceneObject.update();
        }

        scope._ruler3d.findRules(scope._scene.currentView3DObject);
    };

    scope.changeCurrentModelHeight = function(val=1, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var cHeight = sceneObject.getWidth();
        var ratio = (cHeight + val) / cHeight;

        if ( keepRatio ) {
            changeSizesByRatio(ratio);
        } else {
            sceneObject.setHeight(Math.round(cHeight * ratio * 10) / 10);
            sceneObject.update();
        }

        scope._ruler3d.findRules(scope._scene.currentView3DObject);
    };

    scope.changeCurrentModelDepth = function(val=1, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        var cDepth = sceneObject.getWidth();
        var ratio = (cDepth + val) / cDepth;

        if ( keepRatio ) {
            changeSizesByRatio(ratio);
        } else {
            sceneObject.setDepth(Math.round(cDepth * ratio * 10) / 10);
            sceneObject.update();
        }

        scope._ruler3d.findRules(scope._scene.currentView3DObject);
    };

    scope.changeCurrentModelElevation = function(val=1, keepRatio)
    {
        var sceneObject = scope._scene.currentView3DObject.sceneObject;
        sceneObject.y = sceneObject.y + val;
        sceneObject.update();
    };

    scope.stopChangingModelSizes = function()
    {
        scope._scene.history.saveState();
    }
};

extend(R2D.MouseInteractionHelper, EventDispatcher);

R2D.MouseInteractionHelper.MATERIAL_APPLIED = 'MaterialApplied';
R2D.MouseInteractionHelper.MATERIAL_NOT_APPLIED = 'MaterialNotApplied';
R2D.MouseInteractionHelper.STATE_CHANGED = 'MIHStateChanged';

R2D.MIH = {};