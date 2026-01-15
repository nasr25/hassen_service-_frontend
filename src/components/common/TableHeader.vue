<template>
  <header class="bg-gray-50 px-6 py-8 ">
    <div>
      <h4 class="">{{ title }}</h4>
      <!-- Breadcrumb -->
      <nav
        class="flex mb-4"
        aria-label="Breadcrumb"
      >
        <ul class="inline-flex items-center space-x-1 md:space-x-3">
          <li
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
            class="inline-flex items-center"
          >
            <div class="flex items-center">
              <!-- Chevron separator (skip for first item) -->
              <svg
                v-if="index > 0"
                :class="['w-4 h-4 text-gray-400 mx-2', $i18n.locale === 'ar' ? 'rotate-180' : '']"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>

              <router-link :to="crumb.link">
                <span :class="[index === breadcrumbs.length - 1 ? 'text-red cursor-default' : 'text-gray-700 hover:text-gray-900', 'text-sm font-medium']"> {{ crumb.name }}</span>
              </router-link>
            </div>
          </li>
        </ul>
      </nav>

    </div>

  </header>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { locale } = useI18n();

const props = defineProps({
  title: { type: String, default: "Inventory List" },
  description: { type: String, default: "Manage your assets and inventory." },
  breadcrumbs: {
    type: Array,
    default: () => [
      { name: "Dashboard", link: "#" },
      { name: "Assets", link: "#" },
      { name: "Current List", link: "#" },
    ],
  },
});
</script>
