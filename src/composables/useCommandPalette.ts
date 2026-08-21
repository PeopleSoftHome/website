import { computed, onMounted, onUnmounted, ref } from 'vue';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

const open = ref(false);
const query = ref('');

const BASE_COMMANDS: CommandItem[] = [
  { id: 'home', label: 'Home', description: 'Go to the homepage', href: '/' },
  { id: 'products', label: 'Products', description: 'Explore TalentPro products', href: '/products' },
  { id: 'solutions', label: 'Solutions', description: 'Explore industry solutions', href: '/solutions' },
  { id: 'cases', label: 'Case studies', description: 'See customer results', href: '/cases' },
  { id: 'resources', label: 'Resources', description: 'Guides, reports and insights', href: '/resources' },
  { id: 'ai-family', label: 'AI Family', description: 'Explore AI products', href: '/ai-family' },
  { id: 'search', label: 'Search', description: 'Search the site', shortcut: '/' },
];

export function useCommandPalette() {
  const commands = computed(() => BASE_COMMANDS);

  const filteredCommands = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return commands.value;
    return commands.value.filter((command) => {
      const haystack = [command.label, command.description, ...(command.keywords || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

  const close = () => {
    open.value = false;
    query.value = '';
  };

  const show = () => {
    open.value = true;
    query.value = '';
  };

  const toggle = () => {
    if (open.value) close();
    else show();
  };

  const onGlobalKeydown = (event: KeyboardEvent) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (isShortcut) {
      event.preventDefault();
      toggle();
      return;
    }
    if (event.key === 'Escape' && open.value) {
      event.preventDefault();
      close();
    }
  };

  onMounted(() => window.addEventListener('keydown', onGlobalKeydown));
  onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown));

  return {
    open,
    query,
    commands,
    filteredCommands,
    show,
    close,
    toggle,
  };
}
