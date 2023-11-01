<template>
    <div :class="subContextMenuClass" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div class="sub-context-custom-title">
            {{ subContextTitle }}
            <span class="sub-menu-indicator">&#10157;</span>
        </div>
        <div v-if="showSubcontext" class="sub-context-custom-list sub-menu-items" :style="dynamicPosition">
            <template v-for="customSub in submenus">
                <ContextSub
                    :subContextTitle="customSub.name"
                    :submenus="customSub.customSubMenus"
                    :actions="customSub.contextActions"
                >
                </ContextSub>
            </template>

            <div v-for="subMenuAction in actions">
                <div class="sub-menu" @click="contextAction(subMenuAction.eventToCall)">
                    {{ subMenuAction.name }}
                </div>
            </div>
            <!-- <slot></slot> -->
        </div>
    </div>
</template>

<script lang="ts">
import { CustomSubMenu, CustomContextAction } from '@AthenaShared/interfaces/item.js';
import { defineComponent, ref, toRefs } from 'vue';
import ContextSubRecursive from './ContextCustomSub.vue';

export default defineComponent({
    name: 'ContextSub',

    props: {
        subContextTitle: {
            type: String,
            required: true,
        },
        submenus: {
            type: Array<CustomSubMenu>,
            default: () => [],
        },
        actions: {
            type: Array<CustomContextAction>,
            default: () => [],
        },
        isTopLevel: Boolean,
    },
    data() {
        return {
            showSubcontext: false,
            // submenus: [] as Array<CustomSubMenu>,
            mouseX: 100,
            mouseY: 100,
        };
    },
    methods: {
        handleMouseEnter(event) {
            this.mouseX = event.clientX + 4; // Offset für korrekte Positionierung
            this.mouseY = event.clientY;
            this.showSubcontext = true;
        },
        handleMouseLeave() {
            this.showSubcontext = false;
        },
        contextAction(eventToCall: string | string[] = undefined) {
            //Execute contextAction from parent
            this.$parent.$emit('contextParentAction', 'custom', eventToCall);
        },
    },
    computed: {
        subContextMenuClass() {
            if (this.isTopLevel) {
                return 'sub-context-top-level';
            } else if (this.submenus.length > 0) {
                return ''; //sub-context-with-submenu
            } else {
                return ''; //sub-context-custom-frame
            }
        },
        dynamicPosition() {
            if (this.isTopLevel) {
                return {
                    left: this.mouseX + 20 + 'px',
                    top: this.mouseY + 'px',
                };
            } else {
                return {
                    left: 20,
                    top: 0,
                };
            }
        },
    },
    setup(props) {
        const { subContextTitle, submenus } = toRefs(props);
        const showSubcontext = ref(false); // Standardmäßig geschlossen

        return {
            showSubcontext,
        };
    },
});
</script>

<style>
.sub-context-custom-list {
    display: flex;
    flex-direction: column;
}

.sub-context-custom-list > div {
    padding: 6px;
    text-align: left;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.1s ease-in-out;
}

.sub-context-custom-list > div:hover {
    background: #353535;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
}

.sub-context-custom-list > div:active {
    background: #9a9a9a;
    text-shadow: 0px 0px 10px white;
}

.sub-context-custom-frame {
    position: absolute;
    /* Gemeinsamer Stil für alle Untermenüs */
    /* ... andere Stile ... */
}

.sub-context-with-submenu {
    left: 100%;
    /* Stil für Untermenüs mit weiteren Untermenüs */
    /* ... andere Stile ... */
}

.sub-context-top-level {
    /* Stil nur für die ersten Einträge auf Ebene 0 */
    /* ... Stil für die ersten Einträge ... */
}

.sub-menu {
    position: relative; /* Ermöglicht die Positionierung der Untermenü-Elemente */
}
.sub-menu-indicator {
    margin-left: 4px; /* Geringer Abstand zwischen Menüpunkt und Pfeil */
    color: #ccc;
    font-size: 12px;
    transform: rotate(90deg);
}
.sub-menu-items {
    position: fixed;
    top: 0;
    left: 80%;
    /* left: 100%; */
    min-width: 200px;
    background-color: rgba(0, 0, 0, 0.75);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    z-index: 1;

    /* Neue Positionierung: */
    /* Verwende translateX, um das Submenü rechts neben den Menüpunkt zu positionieren */
    transform: translateX(4px);
}
.sub-menu-indicator {
    margin-left: auto; /* Verschiebt das Symbol nach rechts */
    color: #ccc; /* Farbe des Symbols */
    font-size: 12px;
    transform: rotate(90deg); /* Drehung um 90 Grad */
}

/* Stil für Untermenüeinträge in der zweiten Ebene */
.sub-menu-items .sub-menu:hover {
    background: #353535;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
}
</style>
