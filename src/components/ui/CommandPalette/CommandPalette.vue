<template>
  <Teleport to="body">
    <Transition name="command-palette">
      <div v-if="open" class="palette-shell" @mousedown.self="close">
        <section class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
          <div class="palette-search">
            <span class="palette-icon" aria-hidden="true">⌘</span>
            <input
              ref="inputRef"
              v-model="query"
              type="search"
              autocomplete="off"
              placeholder="Search products, solutions, resources…"
              aria-label="Search commands"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="executeSelected"
            />
            <kbd>Esc</kbd>
          </div>

          <div class="palette-list" role="listbox" aria-label="Commands">
            <button
              v-for="(item, index) in filteredCommands"
              :key="item.id"
              class="palette-item"
              :class="{ selected: index === selectedIndex }"
              type="button"
              role="option"
              :aria-selected="index === selectedIndex"
              @mouseenter="selectedIndex = index"
              @click="execute(item)"
            >
              <span class="palette-item-main">
                <strong>{{ item.label }}</strong>
                <small>{{ item.description }}</small>
              </span>
              <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
            </button>

            <p v-if="filteredCommands.length === 0" class="palette-empty">
              No matching commands.
            </p>
          </div>

          <footer class="palette-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Open</span>
            <span><kbd>Esc</kbd> Close</span>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCommandPalette, type CommandItem } from '@/composables/useCommandPalette';

const router = useRouter();
const { open, query, filteredCommands, close } = useCommandPalette();
const inputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

watch(open, async (value) => {
  if (value) {
    selectedIndex.value = 0;
    await nextTick();
    inputRef.value?.focus();
  }
});

watch(query, () => {
  selectedIndex.value = 0;
});

const move = (delta: number) => {
  const total = filteredCommands.value.length;
  if (!total) return;
  selectedIndex.value = (selectedIndex.value + delta + total) % total;
};

const execute = (item: CommandItem) => {
  close();
  if (item.action) {
    item.action();
  } else if (item.id === 'search') {
    window.dispatchEvent(new CustomEvent('command:search'));
  } else if (item.href) {
    router.push(item.href);
  }
};

const executeSelected = () => {
  const item = filteredCommands.value[selectedIndex.value];
  if (item) execute(item);
};
</script>

<style scoped>
.palette-shell {
  position: fixed;
  inset: 0;
  z-index: 11000;
  display: grid;
  place-items: start center;
  padding: 12vh 20px 20px;
  background: var(--black-alpha-50);
  backdrop-filter: blur(10px);
}
.palette {
  width: min(680px, 100%);
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  box-shadow: var(--shadow-xl);
}
.palette-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--card-border);
}
.palette-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--input-color);
  font-size: 17px;
}
.palette-icon { color: var(--gray-400); }
kbd {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 7px;
  border: 1px solid var(--card-border);
  border-bottom-width: 2px;
  border-radius: var(--radius-sm);
  background: var(--gray-50);
  color: var(--gray-600);
  font: inherit;
  font-size: 12px;
}
.palette-list { max-height: 52vh; overflow: auto; padding: 8px; }
.palette-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.palette-item.selected { background: var(--primary-subtle-bg); }
.palette-item-main { flex: 1; display: grid; gap: 3px; }
.palette-item-main strong { font-size: 14px; }
.palette-item-main small { color: var(--gray-500); font-size: 12px; }
.palette-empty { padding: 24px 16px; color: var(--gray-500); text-align: center; }
.palette-footer { display: flex; flex-wrap: wrap; gap: 16px; padding: 10px 14px; border-top: 1px solid var(--card-border); color: var(--gray-500); font-size: 12px; }
.palette-footer span { display: inline-flex; align-items: center; gap: 4px; }
.command-palette-enter-active, .command-palette-leave-active { transition: opacity .18s ease; }
.command-palette-enter-from, .command-palette-leave-to { opacity: 0; }
@media (max-width: 640px) {
  .palette-shell { padding: 8vh 10px 10px; }
  .palette { border-radius: var(--radius-lg); }
}
</style>
