import * as alt from 'alt-server';

import * as Athena from '@AthenaServer/api/index.js';
import { ClothingInfo, StoredItem } from '@AthenaShared/interfaces/item.js';

/**
 * THIS IS A DEFAULT SYSTEM.
 * IF YOU WANT TO DISABLE IT, MAKE A PLUGIN AND DISABLE IT THROUGH:
 * `Athena.systems.defaults.x.disable()`
 *
 * DO NOT APPEND ANY ADDITIONAL DATA TO THIS SYSTEM.
 * COPY THE CODE AND REMAKE IT AS A PLUGIN IF YOU WANT TO MAKE CHANGES.
 */

const SYSTEM_NAME = 'Clothing Crafting';

let enabled = true;

const Internal = {
    combineData(item1: StoredItem<ClothingInfo>, item2: StoredItem<ClothingInfo>): ClothingInfo | undefined {
        if (item1.data.sex !== item2.data.sex) {
            return undefined;
        }

        const data: ClothingInfo = {
            sex: item1.data.sex,
            components: [],
            componentsAlternatives: [],
        };

        //Corechange: Prevent crafting of same clothing components

        const mergedComponents = Internal.mergeComponents(item1.data.components, item2.data.components);
        if (!mergedComponents) {
            return undefined;
        }

        data.components = mergedComponents;
        data.componentsAlternatives = Internal.generateAlternativeComponents(mergedComponents);

        // data.components = data.components.concat(item1.data.components, item2.data.components);
        // data.componentsAlternatives = data.componentsAlternatives.concat(item1.data.components, item2.data.components);
        return data;
    },
    componentExistsInList(component: ClothingComponent, list: ClothingComponent[]): boolean {
        return list.some((c) => c.id === component.id);
    },
    mergeComponents(components1: ClothingComponent[], components2: ClothingComponent[]): ClothingComponent[] | null {
        const mergedComponents: ClothingComponent[] = [];

        for (const component of components1) {
            if (!Internal.componentExistsInList(component, mergedComponents)) {
                mergedComponents.push({
                    ...component,
                    name: component.name || Internal.generateComponentName(component),
                });
            }
        }

        for (const component of components2) {
            if (!Internal.componentExistsInList(component, mergedComponents)) {
                mergedComponents.push({
                    ...component,
                    name: component.name || Internal.generateComponentName(component),
                });
            } else {
                // If the component already exists, do nothing and return null
                return null;
            }
        }

        return mergedComponents.length > 0 ? mergedComponents : null;
    },
    generateAlternativeComponents(components: ClothingComponent[]): ClothingComponent[] {
        // Logic to generate alternative components based on the merged components
        // These can have similar IDs but with different names
        const alternativeComponents: ClothingComponent[] = [];
        for (const component of components) {
            alternativeComponents.push({
                ...component,
                name: component.name || Internal.generateComponentName(component),
            });
        }
        return alternativeComponents;
    },
    generateComponentName(component: ClothingComponent) {
        return `Component_${component.id}_${component.drawable}_${component.texture}_${component.palette}_${component.dlc}`;
    },
    async init() {
        if (!enabled) {
            return;
        }

        Athena.systems.inventory.crafting.addRecipe({
            uid: `clothing`,
            combo: ['clothing', 'clothing'],
            quantities: [1, 1],
            result: {
                dbName: 'clothing',
                quantity: 1,
                data: Internal.combineData,
            },
            sound: 'item_clothing_combine',
        });

        alt.log(`~lc~Default System: ~g~${SYSTEM_NAME}`);
    },
};

/**
 * Disable the default clothing crafting combinations.
 *
 * #### Example
 * ```ts
 * Athena.systems.defaults.clothingCrafting.disable();
 * ```
 *
 *
 */
export function disable() {
    enabled = false;
    alt.log(`~y~Default ${SYSTEM_NAME} Turned Off`);
}

Athena.systems.plugins.addCallback(Internal.init);
