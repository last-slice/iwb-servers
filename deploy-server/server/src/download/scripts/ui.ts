
import * as fs from 'fs';

export async function writeUIFile(location:string, data:any){
    let template = await writeFile()
    await fs.writeFileSync(location, template);
}

async function writeFile(){
    let scene = await writeImports()
    scene = await writeUISetup(scene)
    return scene
}

async function writeImports(){
    let scene = `
import {
    engine,
    Transform,
    UiCanvasInformation,
    } from '@dcl/sdk/ecs'
    import { Color4 } from '@dcl/sdk/math'
    import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
    import { uiSizer } from './helpers'
    import { createDialogPanel } from './dialogPanel'
    import { createShowTextComponent } from './showTextComponent'
`
return scene
}

async function writeUISetup(scene:any){
    scene += `
export function setupUi() {
    ReactEcsRenderer.setUiRenderer(uiComponent)
    engine.addSystem(uiSizer)
    }
    
    const uiComponent = () => [
    createShowTextComponent(),
    createDialogPanel(),
    ]
`
return scene
}


