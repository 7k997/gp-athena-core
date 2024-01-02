import { readFileSync, existsSync, createReadStream } from 'fs';
import * as alt from 'alt-server';
import { DlcInfo, PedComponent } from '@AthenaPlugins/athena-plugin-clothing/shared/interfaces.js';

let pedComponents: PedComponent[] = null;
let pedComponentMaps: Map<number, { DlcCollectionName: string, DlcCollectionHash: number, RelativeCollectionDrawableId: number }>[][] =
  Array.from({ length: 2 }, () => Array.from({ length: 12 }, () => new Map()));

let pedPropMaps: Map<number, { DlcCollectionName: string, DlcCollectionHash: number, RelativeCollectionDrawableId: number }>[][] =
  Array.from({ length: 2 }, () => Array.from({ length: 12 }, () => new Map()));

export class DlcHelper {
    
    /**
     * Initializes Dlc Helper
     * @static
     * @memberof DlcHelper
     */
    static init() {
        pedComponents = DlcHelper.LoadDataFromJsonFile<PedComponent[]>(
            'src/core/plugins/athena-plugin-clothing/server/data/pedComponentVariations_free.json',
        );

        DlcHelper.createMapsFromPedComponents(pedComponents);
    }

    public static createMapsFromPedComponents(pedComponents: PedComponent[]) {      
        for (const pedComponent of pedComponents) {
            let genderID = pedComponent.PedName === 'mp_f_freemode_01' ? 0 : 1;
            let dlcsHash = 0;
            if(pedComponent.DlcCollectionName !== 'mp_f_freemode_01' && pedComponent.DlcCollectionName !== 'mp_m_freemode_01'){
                dlcsHash = alt.hash(pedComponent.DlcCollectionName);
            }    

            for (const variation of pedComponent.ComponentVariations) {
                let componentId = variation.ComponentId;
                const key = variation.DrawableId;
                const value = {
                DlcCollectionName: pedComponent.DlcCollectionName,
                DlcCollectionHash: dlcsHash,
                RelativeCollectionDrawableId: variation.RelativeCollectionDrawableId
                };
        
                pedComponentMaps[genderID][componentId].set(key, value);
            }

            for (const variation of pedComponent.Props) {
                let componentId = variation.ComponentId;
                const key = variation.DrawableId;
                const value = {
                    DlcCollectionName: pedComponent.DlcCollectionName,
                    DlcCollectionHash: dlcsHash,
                    RelativeCollectionDrawableId: variation.RelativeCollectionDrawableId
                };
        
                pedPropMaps[genderID][componentId].set(key, value);
            }
        }
    }

    public static getDlcClothesInfo(gender: number, componentId: number, drawableId: number): DlcInfo | null
    {         
        const info = pedComponentMaps[gender][componentId].get(drawableId);
        if(info)
        {
            return {
                DlcCollectionName: info.DlcCollectionName,
                DlcCollectionHash: info.DlcCollectionHash,
                RelativeCollectionDrawableId: info.RelativeCollectionDrawableId
            };
        }      
        
        return null; 
    }

    public static getDlcPropInfo(gender: number, componentId: number, drawableId: number): DlcInfo | null
    {         
        const info = pedPropMaps[gender][componentId].get(drawableId);
        if(info)
        {
            return {
                DlcCollectionName: info.DlcCollectionName,
                DlcCollectionHash: info.DlcCollectionHash,
                RelativeCollectionDrawableId: info.RelativeCollectionDrawableId
            };
        }      
        
        return null; 
    }

    public static LoadDataFromJsonFile<TDumpType>(filePath: string): TDumpType | null {
        let dumpResult: TDumpType | null = null;
        try {
            if (!existsSync(filePath)) {
                alt.logError(`Could not find dump file at ${filePath}`);
                return null;
            }

            const fileContent = readFileSync(filePath, 'utf-8');
            // dumpResult = JSON.parse(fileContent) as TDumpType;
            dumpResult = JSON.parse(fileContent) as TDumpType;
            // dumpResult = Object.assign(new (dumpResult as any).constructor(), dumpResult);
            alt.log(`Successfully loaded dump file ${filePath}.`);
        } catch (e) {
            alt.logError(`Failed loading dump: ${e}`);
        }

        return dumpResult;
    }

}