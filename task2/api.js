R2D.createPlannerAPI = function(planner)
{
    planner.scene = planner.apiScene = new EventDispatcher();
    planner.view3d = planner.apiView3d = {};
    planner.view2d = planner.apiView2d = {};
    planner.viewWalk = planner.apiViewWalk = {};
    planner.constr = planner.apiConstr = new EventDispatcher();
    planner.units = {};

    planner.view3d.activate = function() {R2D.Viewers.enableViewer(2)};
    planner.view3d.isActive = function() {return R2D.Viewers.getCurrentViewer() == R2D.view3d};
    planner.view2d.activate = function() {R2D.Viewers.enableViewer(1)};
    planner.view2d.isActive = function() {return R2D.Viewers.getCurrentViewer() == R2D.view2d};
    planner.viewWalk.activate = function() {R2D.Viewers.enableViewer(3)};
    planner.viewWalk.isActive = function() {return R2D.Viewers.getCurrentViewer() == R2D.viewWalk};
    planner.constr.activate = function() {R2D.Viewers.enableViewer(0)};
    planner.constr.isActive = function() {return R2D.Viewers.getCurrentViewer() == R2D.viewConstructor};

    // --- constructor ---

    planner.constr.STATE_MAIN = 'stateMain';
    planner.constr.STATE_SELECTED_POINT = 'stateSelectedPoint';
    planner.constr.STATE_SELECTED_ROOM = 'stateSelectedRoom';
    planner.constr.STATE_SELECTED_COVER = 'stateSelectedCover';
    planner.constr.STATE_SELECTED_LOW_AREA = 'stateSelectedLowArea';
    //planner.constr.STATE_SELECTED_RULER = 'stateSelectedRuler';

    planner.constr.STATE_MAKING_WALL = 'stateMakingWall';
    planner.constr.STATE_MAKING_ROOM = 'stateMakingRoom';
    planner.constr.STATE_MAKING_WALL_SHAPE = 'stateMakingWallShape';
    planner.constr.STATE_MAKING_WALL_CUTOUT = 'stateMakingWallCutout';
    planner.constr.STATE_MAKING_COVER = 'stateMakingCover';
    planner.constr.STATE_MAKING_COVER_CUTOUT = 'stateMakingCoverCutout';
    planner.constr.STATE_MAKING_LOW_AREA = 'stateMakingLowArea';
    //planner.constr.STATE_MAKING_RULER = 'stateMakingRuler';
    planner.constr.STATE_ALIGN_PLAN = 'stateAlignPlan';

    planner.constr.ALIGN_PLAN_ASK_LENGTH = 'alignPlanAskLength';
    planner.constr.ALIGN_PLAN_LENGTH_INCORRECT = 'alignPlanLengthIncorrect';
    planner.constr.CHANGED_UNDO_REDO = 'changedUndoRedo';

    planner.constr.makeWall = function() {WC.wallsEditor.startMakeWalls()};
    planner.constr.makeRoom = function() {WC.wallsEditor.startMakeRect()};
    planner.constr.makeWallShape = function() {WC.wallsEditor.startMakeRoom()};
    planner.constr.makeWallCutout = function() {WC.wallsEditor.startCutRoom()};
    planner.constr.makeCover = function() {WC.wallsEditor.startMakeCover()};
    planner.constr.makeCoverCutout = function() {WC.wallsEditor.startCutCover()};
    planner.constr.makeLowArea = function() {WC.wallsEditor.startMakeArea()};
    planner.constr.finish = function() {WC.wallsEditor.stopMake()};
    planner.constr.deleteSelected = function () {WC.wallsEditor.quickDelete()};
    //planner.constr.makeRuler = function () {WC.wallsEditor.addRuler()};

    planner.constr.uploadPlan = function() {WC.wallsEditor.startUploadDrawing()};
    planner.constr.alignPlan = function() {if (! planner.constr.hasPlan()) return; WC.wallsEditor.startAlignDrawing()};
    planner.constr.stopAlignPlan = function() {WC.wallsEditor.stopAlignDrawing()};
    planner.constr.deletePlan = function() {WC.wallsEditor.delImageDrawing()};
    planner.constr.hasPlan = function() {return Boolean(WC.wallsEditor.imgDrawing)};
    planner.constr.getPlanAlignLength = function() {return WC.wallsEditor.stateAlignDrawing.getAlignerValue()};
    planner.constr.setPlanAlignLength = function(length) {WC.wallsEditor.stateAlignDrawing.setAlignerValue(length)};

    planner.constr.setWallsHeight = function() {WC.wallsEditor.setWallsHeight(200)};

    planner.constr.undo = function() {WC.wallsEditor.undo()};
    planner.constr.redo = function() {WC.wallsEditor.redo()};
    planner.constr.canUndo = function() {return WC.wallsEditor.canUndo()};
    planner.constr.canRedo = function() {return WC.wallsEditor.canRedo()};
    planner.constr.zoomIn = function() {WC.wallsEditor.cameraZoom(-1)};
    planner.constr.zoomOut = function() {WC.wallsEditor.cameraZoom(1)};

    // --- scene ---

    planner.scene.PROJECT_SAVE_COMPLETE = 'projectSaveComplete';
    planner.scene.PROJECT_LOAD_COMPLETE = 'projectLoadComplete';
    planner.scene.PROJECT_SAVE_ERROR = 'projectSaveError';
    planner.scene.PROJECT_LOAD_ERROR = 'projectLoadError';
    planner.scene.CHANGED_UNDO_REDO = 'changedUndoRedo';

    planner.scene.clear = function() {R2D.controller.clearCurrentScene(true)};
    planner.scene.saveProject = function() {R2D.controller.saveCurrentScene()};
    planner.scene.loadProject = function(id) {R2D.controller.loadScene(id)};
    planner.scene.wasSaved = function() {return R2D.controller.wasSaved()};
    planner.scene.wasChanged = function() {return R2D.controller.wasChanged()};
    planner.scene.undo = function() {R2D.scene.history.undo()};
    planner.scene.redo = function() {R2D.scene.history.redo()};
    planner.scene.canUndo = function() {return R2D.scene.history.isUndo()};
    planner.scene.canRedo = function() {return R2D.scene.history.isRedo()};

    planner.scene.STATE_MAIN = 'stateMain';
    planner.scene.STATE_SELECTED_MODEL = 'stateSelectedModel';
    planner.scene.STATE_SELECTED_GROUP = 'stateSelectedGroup';
    planner.scene.STATE_SELECTED_CONSTR = 'stateSelectedConstr';

    // --- Transformations of selected objects ---

    planner.scene.removeCurrentModel = function() {R2D.scene.removeCurrentObject()};
    planner.scene.removeCurrentGroup = function() {R2D.scene.removeCurrentObject()};
    planner.scene.clearCurrentConstruction = function() {R2D.mouseInteractionHelper.clearFill()};
    planner.scene.duplicateCurrentModel = function() {R2D.mouseInteractionHelper.duplicateCurrentModel()};
    planner.scene.duplicateCurrentGroup = function() {R2D.mouseInteractionHelper.duplicateCurrentGroup()};
    planner.scene.flipCurrentModelX = function() {R2D.mouseInteractionHelper.flipCurrentModelX()};
    planner.scene.flipCurrentModelZ = function() {R2D.mouseInteractionHelper.flipCurrentModelZ()};
    planner.scene.flipCurrentGroupX = function() {R2D.mouseInteractionHelper.flipCurrentGroupX()};
    planner.scene.flipCurrentGroupZ = function() {R2D.mouseInteractionHelper.flipCurrentGroupZ()};

    planner.scene.getAvailableTools = function() {return R2D.mouseInteractionHelper.getAvailableTools()};

    planner.scene.getCurrentModelRotation = function() {return R2D.scene.currentView3DObject ? R2D.scene.currentView3DObject.sceneObject.rotationY : NaN};
    planner.scene.startRotateCurrentModel = function() {R2D.mouseInteractionHelper.startRotateCurrentModel()};
    planner.scene.rotateCurrentModel = function(degrees) {R2D.mouseInteractionHelper.rotateCurrentModel(degrees)};
    planner.scene.stopRotateCurrentModel = function() {R2D.mouseInteractionHelper.stopRotateCurrentModel()};

    planner.scene.getCurrentModelElevation = function() {return R2D.scene.currentView3DObject ? R2D.scene.currentView3DObject.sceneObject.y : NaN};
    planner.scene.startElevateCurrentModel = function() {R2D.mouseInteractionHelper.startElevateCurrentModel()};
    planner.scene.elevateCurrentModel = function(height) {R2D.mouseInteractionHelper.elevateCurrentModel(height)};
    planner.scene.stopElevateCurrentModel = function() {R2D.mouseInteractionHelper.stopElevateCurrentModel()};

    planner.scene.getCurrentGroupRotation = function() {return R2D.scene.currentGroup ? GEOM.toDeg(R2D.scene.currentGroup.rotation) : NaN};
    planner.scene.startRotateCurrentGroup = function() {R2D.mouseInteractionHelper.startRotateCurrentGroup()};
    planner.scene.rotateCurrentGroup = function(degrees) {R2D.mouseInteractionHelper.rotateCurrentGroup(degrees)};
    planner.scene.stopRotateCurrentGroup = function() {R2D.mouseInteractionHelper.stopRotateCurrentGroup()};

    planner.scene.getCurrentGroupElevation = function() {return R2D.scene.currentGroup ? R2D.scene.currentGroup.y : NaN};
    planner.scene.startElevateCurrentGroup = function() {R2D.mouseInteractionHelper.startElevateCurrentGroup()};
    planner.scene.elevateCurrentGroup = function(height) {R2D.mouseInteractionHelper.elevateCurrentGroup(height)};
    planner.scene.stopElevateCurrentGroup = function() {R2D.mouseInteractionHelper.stopElevateCurrentGroup()};

    planner.scene.currentGroupIsMerged = function() {return R2D.scene.currentGroup ? R2D.scene.currentGroup.merged : null};
    planner.scene.mergeCurrentGroup = function() {R2D.mouseInteractionHelper.mergeCurrentGroup()};
    planner.scene.unmergeCurrentGroup = function() {R2D.mouseInteractionHelper.ungroupCurrentGroup()};

    planner.scene.getCurrentMaterialRotation = function() {return R2D.scene.currentView3DObject ? GEOM.toDeg(R2D.scene.currentView3DObject.getMaterialRotation(R2D.scene.currentPartNum)) : NaN};
    planner.scene.startRotateCurrentMaterial = function() {R2D.mouseInteractionHelper.startRotateCurrentMaterial()};
    planner.scene.rotateCurrentMaterial = function(degrees) {R2D.mouseInteractionHelper.rotateCurrentMaterial(degrees)};
    planner.scene.stopRotateCurrentMaterial = function() {R2D.mouseInteractionHelper.stopRotateCurrentMaterial()};

    planner.scene.startMoveCurrentMaterial = function() {R2D.mouseInteractionHelper.startMoveCurrentMaterial()};
    planner.scene.moveCurrentMaterial = function() {R2D.mouseInteractionHelper.moveCurrentMaterial()};
    planner.scene.stopMoveCurrentMaterial = function() {R2D.mouseInteractionHelper.stopMoveCurrentMaterial()};

    // --- Changing sizes of selected objects ---

    planner.scene.getCurrentModelSizes = function() {return R2D.mouseInteractionHelper.getCurrentModelSizes()};
    planner.scene.setCurrentModelWidth = function(width, keepRatio) {R2D.mouseInteractionHelper.setCurrentModelWidth(width, keepRatio)};
    planner.scene.setCurrentModelHeight = function(height, keepRatio) {R2D.mouseInteractionHelper.setCurrentModelHeight(height, keepRatio)};
    planner.scene.setCurrentModelDepth = function(depth, keepRatio) {R2D.mouseInteractionHelper.setCurrentModelDepth(depth, keepRatio)};
    planner.scene.setCurrentModelElevation = function(elevation) {R2D.mouseInteractionHelper.setCurrentModelElevation(elevation)};

    planner.scene.changeCurrentModelWidth = function(val, keepRatio) {R2D.mouseInteractionHelper.changeCurrentModelWidth(val, keepRatio)};
    planner.scene.changeCurrentModelHeight = function(val, keepRatio) {R2D.mouseInteractionHelper.changeCurrentModelHeight(val, keepRatio)};
    planner.scene.changeCurrentModelDepth = function(val, keepRatio) {R2D.mouseInteractionHelper.changeCurrentModelDepth(val, keepRatio)};
    planner.scene.changeCurrentModelElevation = function(elevation) {R2D.mouseInteractionHelper.changeCurrentModelElevation(elevation)};
    planner.scene.stopChangingModelSizes = function() {R2D.mouseInteractionHelper.stopChangingModelSizes()};

    // --- Materials on selected objects ---

    planner.scene.getCurrentModelMaterials = function() {return R2D.mouseInteractionHelper.getCurrentModelMaterials()};
    planner.scene.setMaterialOnCurrentModel = function(index, matId) {R2D.mouseInteractionHelper.setMaterialOnCurrentModel(index, matId)};
    planner.scene.getCurrentConstrMaterial = function() {return R2D.mouseInteractionHelper.getCurrentConstrMaterial()};
    planner.scene.setMaterialOnCurrentConstr = function(matId) {return R2D.mouseInteractionHelper.setMaterialOnCurrentConstr(matId)};

    // --- Dragging from catalog ---

    planner.scene.dragProductFromCatalog = function(id) { R2D.mouseInteractionHelper.dragProductFromCatalog(id)};
    
    // --- Adding from catalog ---                                                                                  //////////////////////////////////////////////////////                                                                         
                                                                                                                    //////////////////////////////////////////////////////
    planner.scene.addProductFromCatalog = function(id) { R2D.mouseInteractionHelper.addProductFromCatalog(id)};    ///////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Project name ---

    planner.scene.setProjectName = function(name) {R2D.scene.updateProjectName(name)};
    planner.scene.getProjectName = function() {R2D.scene.getProjectName()};

    // --- Measuring system ---

    planner.units.METRIC_CM = R2D.DimensionSystem.METRIC_CM;
    planner.units.METRIC_M = R2D.DimensionSystem.METRIC_M;
    planner.units.METRIC_MM = R2D.DimensionSystem.METRIC_MM;
    planner.units.IMPERIAL_FT = R2D.DimensionSystem.IMPERIAL_FT;

    planner.units.getSystem = function () {return R2D.DimensionSystem.getSystem()};
    planner.units.setSystem = function (system) {R2D.DimensionSystem.setSystem(parseInt(system))};
    planner.units.valueToString = function(value) {return R2D.DimensionSystem.toString(value)};
    planner.units.stringToValue = function(str) {return R2D.DimensionSystem.fromString(str)};
    planner.units.getStep = function() {return R2D.DimensionSystem.getStep()};

};

/*
todo: CustomRuler
*/
