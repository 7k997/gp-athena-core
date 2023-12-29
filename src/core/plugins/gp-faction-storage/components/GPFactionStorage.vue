<template>
    <div class="stack fill-full-width">
        <div class="panel pa-4 mb-4">
            <div class="setting-header subtitle-1 mb-2">Storages</div>
            <span class="subtitle-2 mb-2">Locations of storages. Sorted by closest. Only two storages allowed.</span>
            <div class="setting-content">
                <div v-for="(spot, index) in getStorages" :key="index">
                    <div class="split space-between fill-full-width mb-4">
                        <span class="subtitle-2 label">{{ spot.dist.toFixed(2) }} Units Away</span>
                        <template v-if="isOwner">
                            <Button color="red" class="settings-button" @click="() => removeLocation(spot.index)">
                                <Icon :size="12" icon="icon-cross" />
                            </Button>
                        </template>
                        <template v-else>
                            <Button color="red" :disable="true" class="settings-button">
                                <Icon :size="12" icon="icon-cross" />
                            </Button>
                        </template>
                    </div>
                </div>
                <template v-if="isOwner">
                    <Button color="blue" class="settings-button" @click="addCurrentLocation">
                        Add Storage at this location
                    </Button>
                </template>
                <template v-else>
                    <Button :disable="true" class="settings-button"> Add Storage at this location </Button>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { distance } from '../../gp-athena-utils/shared/utility/vector.js';
import { Vector3 } from '../../gp-athena-utils/shared/interfaces/vector.js';
import { Faction } from '../../athena-plugin-factions/shared/interfaces.js';
import { FactionParser } from '../../athena-plugin-factions/webview/utility/factionParser.js';
import { GP_FACTIONS_STORAGE_VIEW_EVENTS } from '../shared/events.js';
import { GP_FACTION_STORAGE_PFUNC } from '../shared/funcNames.js';
import { FactionRank } from '../shared/extensions.js';

const ComponentName = GP_FACTIONS_STORAGE_VIEW_EVENTS.WEBVIEW.NAME;
export default defineComponent({
    name: ComponentName,
    props: {
        faction: Object as () => Faction,
        character: String,
        pos: Object as () => Vector3,
        rot: Object as () => Vector3,
        isOwner: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        Button: defineAsyncComponent(() => import('@components/Button.vue')),
        Icon: defineAsyncComponent(() => import('@components/Icon.vue')),
        Module: defineAsyncComponent(() => import('@components/Module.vue')),
    },
    data() {
        return {
            // No Data Necessary
        };
    },
    computed: {
        getStorages() {
            if (!this.faction.storages) {
                return [];
            }

            const distanceSpots = this.faction.storages.map((storage, index) => {
                const dist = distance(this.pos, storage.pos);
                return {
                    ...storage,
                    dist,
                    index,
                };
            });

            const sortedStorages = distanceSpots.sort((a, b) => {
                return a.dist - b.dist;
            });

            return sortedStorages;
        },
    },
    methods: {
        getRanks(): Array<FactionRank> {
            return FactionParser.getFactionRanks(this.faction);
        },

        isFactionOwner() {
            const member = FactionParser.getMember(this.faction, this.character);

            if (!member) {
                return false;
            }

            return member.hasOwnership;
        },
        addCurrentLocation() {
            if (!('alt' in window)) {
                console.log(`Adding Spot with pos: ${JSON.stringify(this.pos)}`);
                return;
            }

            alt.emit(
                GP_FACTIONS_STORAGE_VIEW_EVENTS.WEBVIEW.ACTION,
                GP_FACTION_STORAGE_PFUNC.ADD_STORAGE,
                this.pos,
                this.rot,
            );
        },
        removeLocation(index: number) {
            if (!('alt' in window)) {
                console.log(`Removing Spot with index: ${index}`);
                return;
            }

            alt.emit(GP_FACTIONS_STORAGE_VIEW_EVENTS.WEBVIEW.ACTION, GP_FACTION_STORAGE_PFUNC.REMOVE_STORAGE, index);
        },
    },
});
</script>

<style></style>
