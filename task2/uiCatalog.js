function createCatalogPanel(planner)
{
    let panel = document.createElement('div');
    panel.style.position = 'absolute';
    panel.style.right = '0px';
    panel.style.top = '0px';

    panel.appendChild(createLabel('Catalog'));
    
    let btnAddModel = createButton('Add model', () => {});         //////////////////////////////////////////////////////////////
    let btnDragModel = createButton('Drag model', () => {});
    let btnDragMaterial = createButton('Drag material', () => {});
    panel.appendChild(btnAddModel);                                //////////////////////////////////////////////////////////////
    panel.appendChild(btnDragModel);
    panel.appendChild(btnDragMaterial);
    btnDragModel.style.cursor = 'grab';
    btnAddModel.style.cursor = 'pointer';                          //////////////////////////////////////////////////////////////
    btnDragMaterial.style.cursor = 'grab';
    
    btnAddModel.addEventListener('click', () => {                  //////////////////////////////////////////////////////////////
        planner.scene.addProductFromCatalog(608);                  //////////////////////////////////////////////////////////////
    });                                                            //////////////////////////////////////////////////////////////
    btnDragModel.addEventListener('mousedown', () => {
        planner.scene.dragProductFromCatalog(608);
    });
    btnDragMaterial.addEventListener('mousedown', () => {
        //planner.scene.dragProductFromCatalog(551);
        planner.scene.dragProductFromCatalog(7447);
    });


    return panel;
}