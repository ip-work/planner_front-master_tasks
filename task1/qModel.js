function createModelQuickPanel(planner, actions)
{
    let qPanel = document.createElement('div');
    qPanel.style.position = 'absolute';
    qPanel.style.right = '0px';
    qPanel.style.top = '0px';
    qPanel.style.width = '60px';

    let btnDelete = createButton('Delete', () => {
        planner.scene.removeCurrentModel();
    });

    let btnDuplicate = createButton('Duplicate', () => {
        planner.scene.duplicateCurrentModel();
    });

    let btnFlipX = createButton('Flip X', () => {
        planner.scene.flipCurrentModelX();
    });

    let btnFlipZ = createButton('Flip Z', () => {
        planner.scene.flipCurrentModelZ();
    });
    
    let btnRotate45 = createButton('Rotate 45&deg', () => {   ///////////////////////////////////////////////////////////////////////
        planner.scene.rotateCurrentModel(45);                 ///////////////////////////////////////////////////////////////////////
    });                                                       ///////////////////////////////////////////////////////////////////////

    let btnRotate = createButton('Rotate');
    btnRotate.addEventListener('mousedown', rotateDownListener);

    var startX = 0;
    var startR = 0;
    function rotateDownListener(e)
    {
        document.addEventListener('mousemove', moveForRotationListener);
        document.addEventListener('mouseup', upForRotationListener);
        startX = e.screenX;
        startR = planner.scene.getCurrentModelRotation();
        planner.scene.startRotateCurrentModel();
    }

    function moveForRotationListener(e)
    {
        var deltaX = e.screenX - startX;
        var newAngle = startR + deltaX / 2;
        planner.scene.rotateCurrentModel(newAngle);
    }

    function upForRotationListener()
    {
        document.removeEventListener('mousemove', moveForRotationListener);
        document.removeEventListener('mouseup', upForRotationListener);

        planner.scene.stopRotateCurrentModel();
    }

    let btnElevate = createButton('Elevate');
    btnElevate.addEventListener('mousedown', elevateDownListener);

    var startY = 0;
    var startH = 0;
    function elevateDownListener(e)
    {
        document.addEventListener('mousemove', moveForElevationListener);
        document.addEventListener('mouseup', upForElevationListener);
        startY = e.screenY;
        startH = planner.scene.getCurrentModelElevation();
        planner.scene.startElevateCurrentModel();
    }

    function moveForElevationListener(e)
    {
        var deltaY =  startY - e.screenY;
        var newHeight = startH + deltaY;
        planner.scene.elevateCurrentModel(newHeight);
    }

    function upForElevationListener()
    {
        document.removeEventListener('mousemove', moveForElevationListener);
        document.removeEventListener('mouseup', upForElevationListener);

        planner.scene.stopElevateCurrentModel();
    }

    if (actions.remove) qPanel.appendChild(btnDelete);
    if (actions.duplicate) qPanel.appendChild(btnDuplicate);
    if (actions.flipX) qPanel.appendChild(btnFlipX);
    if (actions.flipZ) qPanel.appendChild(btnFlipZ);
    if (actions.rotate) {qPanel.appendChild(btnRotate); qPanel.appendChild(btnRotate45);} //////////////////////////////////////////////
    if (actions.elevate) qPanel.appendChild(btnElevate);

    return qPanel;
}
