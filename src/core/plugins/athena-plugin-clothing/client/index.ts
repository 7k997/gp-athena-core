import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api/index.js';
import ViewModel from '../../../client/models/viewModel.js';
// Removed - working with player ped not with PedCharacter
// import { PedCharacter } from '../../../client/utility/characterPed.js';
import { SYSTEM_EVENTS } from '../../../shared/enums/system.js';
import { Appearance } from '../../../shared/interfaces/appearance.js';
import { ClothingComponent, Item, ItemEx } from '../../../shared/interfaces/item.js';
import { CLOTHING_CONFIG } from '../shared/config.js';
import { CLOTHING_INTERACTIONS } from '../shared/events.js';
import { CLOTHING_DLC_INFO, IClothingStore, IClothingStorePage } from '../shared/interfaces.js';

const FreemodeFemale01 = 2627665880;
const FreeModeMale01 = 1885233650;

const PAGE_NAME = 'Clothing';
const CAMERA_POSITIONS = [
    { zpos: 0.6, fov: 33 }, // Hat
    { zpos: 0.6, fov: 33 }, // Mask
    { zpos: 0.18999999999999967, fov: 49 }, // Shirt
    { zpos: -0.47000000000000064, fov: 59 }, // Bottoms
    { zpos: -0.7100000000000009, fov: 53 }, // Shoes
    { zpos: 0.61, fov: 29 }, // Glasses
    { zpos: 0.62, fov: 29 }, // Earrings / Earpieces
    { zpos: 0.2799999999999997, fov: 57 }, // Backpacks
    { zpos: 0.2799999999999997, fov: 57 }, // Armour
    { zpos: -0.09999999999999902, fov: 45 }, // Wrist Watch
    { zpos: -0.09999999999999902, fov: 45 }, // Bracelet
];

let equipment: Array<ItemEx<ClothingComponent>> = [];
let appearance: Appearance = null;
let storeData: IClothingStore = null;
let isOpen = false;

/**
 * Do Not Export Internal Only
 */
class InternalFunctions implements ViewModel {
    static async open(
        _storeData: IClothingStore,
        _appearance: Appearance,
        _equipment: Array<ItemEx<ClothingComponent>>,
    ) {
        if (AthenaClient.webview.isAnyMenuOpen(true)) {
            return;
        }

        storeData = _storeData;
        appearance = _appearance;
        equipment = _equipment;

        AthenaClient.webview.on(CLOTHING_INTERACTIONS.CLOSE, InternalFunctions.close);
        AthenaClient.webview.on(CLOTHING_INTERACTIONS.UPDATE, InternalFunctions.update);
        AthenaClient.webview.on(CLOTHING_INTERACTIONS.PURCHASE, InternalFunctions.purchase);
        AthenaClient.webview.on(CLOTHING_INTERACTIONS.POPULATE, InternalFunctions.populate);
        AthenaClient.webview.on(CLOTHING_INTERACTIONS.DISABLE_CONTROLS, InternalFunctions.controls);
        AthenaClient.webview.on(CLOTHING_INTERACTIONS.PAGE_UPDATE, InternalFunctions.pageUpdate);

        native.doScreenFadeOut(100);

        await alt.Utils.wait(100);

        if (AthenaClient.camera.pedEdit.exists()) {
            await AthenaClient.camera.pedEdit.destroy();
        }

        await AthenaClient.camera.pedEdit.create(alt.LocalPlayer.local.scriptID, { x: -0.2, y: 0, z: 0 }, false);
        AthenaClient.camera.pedEdit.setCamParams(0.6, 65);

        InternalFunctions.setEquipment(equipment);

        alt.Player.local.isMenuOpen = true;
        isOpen = true;

        AthenaClient.webview.ready(PAGE_NAME, InternalFunctions.ready);
        AthenaClient.webview.openPages([PAGE_NAME], true, InternalFunctions.closeAsync);
        AthenaClient.webview.focus();
        AthenaClient.webview.showCursor(true);
        alt.toggleGameControls(false);

        // Top Left
        alt.setWatermarkPosition(2);
    }

    static async closeAsync() {
        AthenaClient.webview.unfocus();
        AthenaClient.webview.showCursor(false);
        alt.toggleGameControls(true);
        alt.Player.local.isMenuOpen = false;

        InternalFunctions.close();
    }

    static async close() {
        native.doScreenFadeOut(100);

        await alt.Utils.wait(100);

        AthenaClient.camera.pedEdit.destroy();

        alt.toggleGameControls(true);
        AthenaClient.webview.setOverlaysVisible(true);
        AthenaClient.webview.closePages([PAGE_NAME]);
        AthenaClient.webview.unfocus();
        AthenaClient.webview.showCursor(false);
        alt.toggleGameControls(true);

        alt.Player.local.isMenuOpen = false;

        native.setEntityAlpha(alt.Player.local.scriptID, 255, false);
        alt.emitServer(CLOTHING_INTERACTIONS.EXIT);
        isOpen = false;

        native.doScreenFadeIn(100);

        alt.setWatermarkPosition(4);
    }

    /**
     * Updates the camera position on page changes.
     * @static
     * @param {number} page
     * @memberof InternalFunctions
     */
    static async pageUpdate(page: number) {
        if (!AthenaClient.camera.pedEdit.exists()) {
            await AthenaClient.camera.pedEdit.create(alt.Player.local.scriptID, { x: -0.2, y: 0, z: 0 }, true);
        }

        if (!CAMERA_POSITIONS[page]) {
            AthenaClient.camera.pedEdit.setCamParams(0.6, 65);
            return;
        }

        AthenaClient.camera.pedEdit.setCamParams(CAMERA_POSITIONS[page].zpos, CAMERA_POSITIONS[page].fov);
    }

    static async ready() {
        AthenaClient.webview.emit(CLOTHING_INTERACTIONS.SET_DATA, storeData);
        AthenaClient.webview.emit(
            CLOTHING_INTERACTIONS.SET_BANK_DATA,
            alt.Player.local.meta.bank + alt.Player.local.meta.cash,
        );
        native.doScreenFadeIn(100);
    }

    static async handleMetaChanged(key: string, _items: Array<Item>, _oldValue: any) {
        if (key === 'bank' || (key === 'cash' && isOpen)) {
            AthenaClient.webview.emit(
                CLOTHING_INTERACTIONS.SET_BANK_DATA,
                alt.Player.local.meta.bank + alt.Player.local.meta.cash,
            );
        }
    }

    static setEquipment(items: Array<ItemEx<ClothingComponent>>) {
        const pages: Array<IClothingStorePage> = new Array(11).fill(null);
        // native.clearAllPedProps(PedCharacter.get(), 0);

        if (items && Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                //Put component into correct page
                if (pages[items[i].data.id]) {
                    if (pages[items[i].data.id].ids) {
                        pages[items[i].data.id].ids.push(items[i].data.id);
                    } else {
                        pages[items[i].data.id].ids = [items[i].data.id];
                    }
                    if (pages[items[i].data.id].drawables) {
                        pages[items[i].data.id].drawables.push(items[i].data.drawable);
                    } else {
                        pages[items[i].data.id].drawables = [items[i].data.drawable];
                    }
                    if (pages[items[i].data.id].textures) {
                        pages[items[i].data.id].textures.push(items[i].data.texture);
                    } else {
                        pages[items[i].data.id].textures = [items[i].data.texture];
                    }
                    //TODO - Add palette support in vue
                    if (pages[items[i].data.id].palettes) {
                        pages[items[i].data.id].palettes.push(items[i].data.palette);
                    } else {
                        pages[items[i].data.id].palettes = [items[i].data.palette];
                    }
                }
            }
        }

        if (!items || !Array.isArray(items)) {
            return;
        }

        InternalFunctions.update(pages, true);
    }

    static controls(value: boolean) {
        AthenaClient.camera.pedEdit.disableControls(value);
    }

    static getDlcClothingCount(sex: number, id: number, isProp: boolean = false): number {
        const dlcInfos = CLOTHING_CONFIG[isProp ? 'DLC_PROPS' : 'DLC_CLOTHING'][id] as Array<CLOTHING_DLC_INFO>;

        let totalCount = 0;

        for (let i = 0; i < dlcInfos.length; i++) {
            if (dlcInfos[i].count[sex]) {
                totalCount += dlcInfos[i].count[sex];
            }
        }

        return totalCount;
    }

    /**
     * Handles how clothes are purchased.
     * @static
     * @param {string} uid
     * @param {number} index
     * @param {ClothingComponent} component
     * @param {string} name
     * @param {string} desc
     * @memberof InternalFunctions
     */
    static purchase(uid: string, pages: Array<IClothingStorePage>, noSound = false) {
        alt.emitServer(CLOTHING_INTERACTIONS.PURCHASE, uid, pages, noSound);
    }

    static async populate(pages: Array<IClothingStorePage>) {
        if (typeof pages === 'string') {
            pages = JSON.parse(pages);
        }

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (!page || !page.drawables) {
                continue;
            }

            for (let index = 0; index < page.drawables.length; index++) {
                const id = page.ids[index];

                let value = page.drawables[index];
                let textureValue = page.textures[index];

                let maxTextures = 0;
                let maxDrawables = 0;

                if (page.isProp) {
                    // Get Current Value of Prop Player is Wearing
                    value = native.getPedPropIndex(alt.LocalPlayer.local, id, 0);

                    if (typeof page.startValue === 'undefined') {
                        page.startValue = value;
                    }

                    page.drawables[index] = value;

                    textureValue = native.getPedPropTextureIndex(alt.LocalPlayer.local, id);
                    page.textures[index] = textureValue;

                    maxDrawables =
                        CLOTHING_CONFIG.MAXIMUM_PROP_VALUES[appearance.sex][id] +
                        InternalFunctions.getDlcClothingCount(appearance.sex, id, true);

                    maxTextures = native.getNumberOfPedPropTextureVariations(alt.LocalPlayer.local, id, value);
                } else {
                    // Get Current Value of Component Player is Wearing
                    value = native.getPedDrawableVariation(alt.LocalPlayer.local, id);

                    page.drawables[index] = value;
                    if (typeof page.startValue === 'undefined') {
                        page.startValue = value;
                    }

                    textureValue = native.getPedTextureVariation(alt.LocalPlayer.local, id);
                    page.textures[index] = textureValue;
                    maxDrawables =
                        CLOTHING_CONFIG.MAXIMUM_COMPONENT_VALUES[appearance.sex][id] +
                        InternalFunctions.getDlcClothingCount(appearance.sex, id, false);
                    maxTextures = native.getNumberOfPedTextureVariations(alt.LocalPlayer.local, id, value);
                }

                page.maxDrawables[index] = maxDrawables;
                page.maxTextures[index] = maxTextures;
            }
        }

        AthenaClient.webview.emit(CLOTHING_INTERACTIONS.PROPAGATE, pages);
    }

    static async update(pages: Array<IClothingStorePage>, justSync = false, populateData = false) {
        if (typeof pages === 'string') {
            pages = JSON.parse(pages);
        }

        alt.emitServer(CLOTHING_INTERACTIONS.UPDATE, pages, justSync, populateData);

        if (justSync) {
            return;
        }

        AthenaClient.camera.pedEdit.update(alt.LocalPlayer.local.scriptID);

        // Only update data if necessary.
        if (!populateData) {
            return;
        }

        // InternalFunctions.populate(pages);
    }
}

alt.on(SYSTEM_EVENTS.META_CHANGED, InternalFunctions.handleMetaChanged);
alt.onServer(CLOTHING_INTERACTIONS.OPEN, InternalFunctions.open);
