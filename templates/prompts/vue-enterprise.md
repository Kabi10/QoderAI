# Vue.js Enterprise Application - AI Generation Prompt

## Project Overview
**Category:** Modern Frontend  
**Project Name:** {{projectName}}  
**Vue Version:** {{vueVersion}}  
**State Management:** {{stateManagement}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Vue.js Features
- {{#hasCompositionAPI}}Composition API for better TypeScript integration{{/hasCompositionAPI}}
- {{#hasVueRouter}}Vue Router for client-side navigation{{/hasVueRouter}}
- {{#hasPinia}}Pinia for state management{{/hasPinia}}
- {{#hasVueUse}}VueUse for composition utilities{{/hasVueUse}}
- {{#hasI18n}}Vue I18n for internationalization{{/hasI18n}}
- {{#hasTesting}}Comprehensive testing with Vitest and Vue Test Utils{{/hasTesting}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete Vue.js enterprise application with the following structure:
```
{{projectName}}/
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Base UI components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature-specific components
│   ├── views/                 # Page-level components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── admin/
│   ├── composables/           # Composition API functions
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── stores/                # Pinia stores
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── router/                # Vue Router configuration
│   │   ├── index.ts
│   │   ├── guards.ts
│   │   └── routes.ts
│   ├── services/              # API services
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── upload.ts
│   ├── utils/                 # Utility functions
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── components.ts
│   │   └── global.ts
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── locales/               # Internationalization files
│   │   ├── en.json
│   │   ├── es.json
│   │   └── fr.json
│   ├── plugins/               # Vue plugins
│   │   ├── i18n.ts
│   │   ├── pinia.ts
│   │   └── directives.ts
│   ├── App.vue                # Root component
│   └── main.ts                # Application entry point
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── utils/
├── public/
│   ├── favicon.ico
│   └── index.html
├── docs/                      # Documentation
│   ├── components.md
│   ├── deployment.md
│   └── development.md
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

### 2. Core Application Setup

#### Main Application Entry (main.ts)
```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { router } from './router';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import App from './App.vue';
import './assets/styles/main.css';

// Import locales
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

// Create Vue app
const app = createApp(App);

// Setup Pinia store
const pinia = createPinia();
pinia.use(createPersistedState({
  storage: localStorage,
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
}));

// Setup i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    es,
    fr,
  },
});

// Install plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info);
  // Send to error reporting service
};

// Mount app
app.mount('#app');
```

#### Root Component (App.vue)
```vue
<template>
  <div
    id="app"
    :class="[
      'min-h-screen bg-background text-foreground',
      { 'dark': isDark }
    ]"
  >
    <!-- Loading overlay -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-sm text-muted-foreground">{{ $t('common.loading') }}</p>
        </div>
      </div>
    </Transition>

    <!-- Error boundary -->
    <ErrorBoundary>
      <!-- Navigation -->
      <AppNavigation v-if="showNavigation" />
      
      <!-- Main content -->
      <main :class="{ 'ml-64': showNavigation && !isMobile }">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="route.meta.transition || 'fade'" mode="out-in">
            <Suspense>
              <component :is="Component" :key="route.fullPath" />
              <template #fallback>
                <div class="flex items-center justify-center min-h-screen">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </template>
            </Suspense>
          </Transition>
        </RouterView>
      </main>

      <!-- Toast notifications -->
      <NotificationContainer />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useAppStore } from './stores/app';
import { useTheme } from './composables/useTheme';
import { useBreakpoints } from './composables/useBreakpoints';
import AppNavigation from './components/layout/AppNavigation.vue';
import ErrorBoundary from './components/ui/ErrorBoundary.vue';
import NotificationContainer from './components/ui/NotificationContainer.vue';

const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();
const { isDark } = useTheme();
const { isMobile } = useBreakpoints();

const isLoading = computed(() => appStore.isLoading);
const showNavigation = computed(() => authStore.isAuthenticated && !router.currentRoute.value.meta.hideNavigation);

onMounted(async () => {
  // Initialize app
  await appStore.initialize();
  
  // Check authentication status
  if (authStore.token) {
    await authStore.validateToken();
  }
});

// Watch for route changes to update document title
watch(
  () => router.currentRoute.value,
  (route) => {
    const title = route.meta.title as string;
    document.title = title ? `${title} | {{projectName}}` : '{{projectName}}';
  },
  { immediate: true }
);
</script>

<style>
/* Global styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

### 3. State Management with Pinia

#### Auth Store (stores/auth.ts)
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { authService } from '../services/auth';
import { useNotificationStore } from './notification';
import type { User, LoginCredentials, RegisterData } from '../types/auth';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const { t } = useI18n();
  const notificationStore = useNotificationStore();

  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed(() => user.value?.role);
  const userName = computed(() => user.value?.name || user.value?.email);

  // Actions
  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);
      
      token.value = response.token;
      user.value = response.user;
      
      localStorage.setItem('auth_token', response.token);
      
      notificationStore.addNotification({
        type: 'success',
        title: t('auth.login.success'),
        message: t('auth.login.welcomeBack', { name: userName.value }),
      });

      // Redirect to intended route or dashboard
      const redirectTo = router.currentRoute.value.query.redirect as string || '/dashboard';
      await router.push(redirectTo);
      
    } catch (err: any) {
      error.value = err.message || t('auth.login.error');
      notificationStore.addNotification({
        type: 'error',
        title: t('auth.login.failed'),
        message: error.value,
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterData) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.register(data);
      
      token.value = response.token;
      user.value = response.user;
      
      localStorage.setItem('auth_token', response.token);
      
      notificationStore.addNotification({
        type: 'success',
        title: t('auth.register.success'),
        message: t('auth.register.welcome', { name: userName.value }),
      });

      await router.push('/dashboard');
      
    } catch (err: any) {
      error.value = err.message || t('auth.register.error');
      notificationStore.addNotification({
        type: 'error',
        title: t('auth.register.failed'),
        message: error.value,
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await authService.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call success
      user.value = null;
      token.value = null;
      localStorage.removeItem('auth_token');
      
      await router.push('/auth/login');
      
      notificationStore.addNotification({
        type: 'info',
        title: t('auth.logout.success'),
        message: t('auth.logout.goodbye'),
      });
    }
  }

  async function validateToken() {
    if (!token.value) return false;

    try {
      const response = await authService.validateToken(token.value);
      user.value = response.user;
      return true;
    } catch (err) {
      // Token is invalid, clear it
      await logout();
      return false;
    }
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user.value) return;

    try {
      const updatedUser = await authService.updateProfile(updates);
      user.value = { ...user.value, ...updatedUser };
      
      notificationStore.addNotification({
        type: 'success',
        title: t('profile.update.success'),
        message: t('profile.update.saved'),
      });
      
      return updatedUser;
    } catch (err: any) {
      notificationStore.addNotification({
        type: 'error',
        title: t('profile.update.failed'),
        message: err.message,
      });
      throw err;
    }
  }

  function hasRole(role: string): boolean {
    return userRole.value === role;
  }

  function hasAnyRole(roles: string[]): boolean {
    return roles.includes(userRole.value || '');
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    login,
    register,
    logout,
    validateToken,
    updateProfile,
    hasRole,
    hasAnyRole,
  };
}, {
  persist: {
    paths: ['token'],
  },
});
```

### 4. Composables

#### API Composable (composables/useApi.ts)
```typescript
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any>(url: string, options: ApiOptions = {}) {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();

  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const isLoading = ref(false);
  const isFinished = ref(false);

  const execute = async (executeOptions: ApiOptions = {}) => {
    const mergedOptions = { ...options, ...executeOptions };
    const {
      method = 'GET',
      headers = {},
      body,
      showSuccessNotification = false,
      showErrorNotification = true,
      successMessage,
      errorMessage,
    } = mergedOptions;

    isLoading.value = true;
    isFinished.value = false;
    error.value = null;

    try {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (authStore.token) {
        requestHeaders.Authorization = `Bearer ${authStore.token}`;
      }

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, requestOptions);

      if (!response.ok) {
        if (response.status === 401) {
          await authStore.logout();
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      data.value = responseData;

      if (showSuccessNotification && successMessage) {
        notificationStore.addNotification({
          type: 'success',
          title: 'Success',
          message: successMessage,
        });
      }

      return responseData;
    } catch (err: any) {
      error.value = err;
      
      if (showErrorNotification) {
        notificationStore.addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage || err.message,
        });
      }
      
      throw err;
    } finally {
      isLoading.value = false;
      isFinished.value = true;
    }
  };

  const canRetry = computed(() => isFinished.value && !!error.value);

  const retry = () => {
    if (canRetry.value) {
      return execute();
    }
  };

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    isFinished: readonly(isFinished),
    canRetry,
    execute,
    retry,
  };
}

// Convenience methods
export function useGet<T = any>(url: string, options: Omit<ApiOptions, 'method'> = {}) {
  return useApi<T>(url, { ...options, method: 'GET' });
}

export function usePost<T = any>(url: string, options: Omit<ApiOptions, 'method'> = {}) {
  return useApi<T>(url, { ...options, method: 'POST' });
}

export function usePut<T = any>(url: string, options: Omit<ApiOptions, 'method'> = {}) {
  return useApi<T>(url, { ...options, method: 'PUT' });
}

export function useDelete<T = any>(url: string, options: Omit<ApiOptions, 'method'> = {}) {
  return useApi<T>(url, { ...options, method: 'DELETE' });
}
```

### 5. Vue Router Configuration

#### Router Setup (router/index.ts)
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { routes } from './routes';
import { beforeEachGuard, afterEachGuard } from './guards';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  },
});

// Global navigation guards
router.beforeEach(beforeEachGuard);
router.afterEach(afterEachGuard);

// Route error handling
router.onError((error) => {
  console.error('Router error:', error);
  // Handle chunk loading errors
  if (error.message.includes('Loading chunk')) {
    window.location.reload();
  }
});
```

#### Route Guards (router/guards.ts)
```typescript
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAppStore } from '../stores/app';

export async function beforeEachGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  const appStore = useAppStore();

  // Show loading indicator
  appStore.setLoading(true);

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Store the intended destination
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }

  // Check if route requires guest (unauthenticated) access
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  // Check role-based access
  if (to.meta.requiredRoles) {
    const hasRequiredRole = authStore.hasAnyRole(to.meta.requiredRoles as string[]);
    if (!hasRequiredRole) {
      return next({ name: 'unauthorized' });
    }
  }

  // Validate token for protected routes
  if (to.meta.requiresAuth && authStore.token) {
    try {
      const isValid = await authStore.validateToken();
      if (!isValid) {
        return next({
          name: 'login',
          query: { redirect: to.fullPath },
        });
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    }
  }

  next();
}

export function afterEachGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) {
  const appStore = useAppStore();
  
  // Hide loading indicator
  appStore.setLoading(false);

  // Update document title
  const title = to.meta.title as string;
  if (title) {
    document.title = `${title} | {{projectName}}`;
  }

  // Track page view (analytics)
  if (import.meta.env.PROD) {
    // Add your analytics tracking here
    // gtag('config', 'GA_TRACKING_ID', { page_path: to.fullPath });
  }
}
```

### 6. Component Development

#### Base Button Component (components/ui/BaseButton.vue)
```vue
<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2">
      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
    
    <Icon v-if="icon && !loading" :name="icon" :class="iconClasses" />
    
    <span :class="{ 'ml-2': icon && !loading }">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import Icon from './Icon.vue';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface Props extends VariantProps<typeof buttonVariants> {
  tag?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'button',
  variant: 'default',
  size: 'default',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  return buttonVariants({
    variant: props.variant,
    size: props.size,
  });
});

const iconClasses = computed(() => {
  const sizeMap = {
    default: 'h-4 w-4',
    sm: 'h-3 w-3',
    lg: 'h-5 w-5',
    icon: 'h-4 w-4',
  };
  return sizeMap[props.size || 'default'];
});

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>
```

### 7. Build Configuration

#### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/core',
        {
          'pinia': ['defineStore', 'storeToRefs'],
        },
      ],
      dts: true,
      vueTemplate: true,
    }),
    Components({
      dts: true,
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@vueuse/core'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
  },
});
```

## Success Criteria
The generated Vue.js enterprise application should:
1. ✅ Use Vue 3 Composition API with TypeScript
2. ✅ Include comprehensive state management with Pinia
3. ✅ Provide modular component architecture
4. ✅ Include robust routing with guards and meta
5. ✅ Support internationalization and theming
6. ✅ Include comprehensive testing setup
7. ✅ Be production-ready with proper build configuration

## Additional Notes
- Follow Vue.js 3 best practices and composition API patterns
- Implement proper TypeScript integration throughout
- Use modern build tools (Vite) for optimal development experience
- Include comprehensive error handling and loading states
- Implement proper SEO and accessibility features

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*