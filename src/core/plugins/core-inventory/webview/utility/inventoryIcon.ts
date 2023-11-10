import { ClothingComponent, DefaultItemBehavior, Item } from '@AthenaShared/interfaces/item.js';
import { clothingItemToIconName } from '@AthenaShared/utility/clothing.js';
import ResolvePath from '../../../../../../src-webviews/src/utility/pathResolver.js';

type ClothingInfo = { sex: number; components: Array<ClothingComponent> };

export function getImagePath(item: Item): string {
    // Set Default Image
    if (!item.data || (item.behavior && !item.behavior.isClothing)) {
        return ResolvePath(item.icon.includes('.png') ? item.icon : item.icon + '.png');
    }

    // Set Clothing Image

    const convertedItem = item as Item<DefaultItemBehavior, ClothingInfo>;

    // Attempt to construct data for icon.
    // Uses first drawable item in array as icon.
    // TODO: Render Outfits images differently. Mark as outfit or render multiple images. Caruselle?
    if (typeof convertedItem.data.sex === 'undefined') {
        return ResolvePath(convertedItem.icon.includes('.png') ? convertedItem.icon : convertedItem.icon + '.png');
    }

    if (!Array.isArray(convertedItem.data.components) || convertedItem.data.components.length <= 0) {
        return ResolvePath(convertedItem.icon.includes('.png') ? convertedItem.icon : convertedItem.icon + '.png');
    }

    return ResolvePath(`../../assets/images/clothing/${clothingItemToIconName(convertedItem)}`);
}
