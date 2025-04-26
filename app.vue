<template>
  <UApp>
    <UTabs color="neutral" :items="items" :ui="{ trigger: 'cursor-pointer' }">
      <template #content>
        <main class="flex flex-col gap-7 p-8">
          <UFormField label="Configs">
            <USelectMenu
              v-model="converter.CONFIGS"
              multiple
              :items="configItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Content">
            <UTextarea
              v-model="converter.CONTENT"
              :maxrows="20"
              autoresize
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              class="text-center justify-center cursor-pointer"
              @click="onClickConvert"
            >
              Convert
            </UButton>
          </div>

          <UFormField>
            <template #label>
              <div class="flex items-center gap-2">
                View changes
                <UIcon
                  v-if="convertedContent"
                  name="iconamoon:copy-thin"
                  :size="24"
                  class="cursor-pointer"
                  @click="onClickCopy"
                />
              </div>
            </template>
            <ClientOnly>
              <CodeDiff
                :old-string="originalContent"
                :new-string="convertedContent"
                output-format="side-by-side"
                class="max-h-[800px]"
              />
            </ClientOnly>
            <CodeReader :text="originalContent" />
          </UFormField>
        </main>
      </template>
      <template #path>
        <main class="flex flex-col align-center gap-7 p-8">
          <UFormField label="Configs">
            <USelectMenu
              v-model="converter.CONFIGS"
              multiple
              :items="configItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Path">
            <UInput v-model="converter.PATH_INPUT" class="w-full" />
          </UFormField>

          <UFormField label="Path Output">
            <UInput v-model="converter.PATH_OUTPUT" class="w-full" />
          </UFormField>

          <UFormField label="Matching Rule">
            <UInput v-model="converter.PATH_MATCH" class="w-full" />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              @click="onClickConvertByPath"
              class="text-center justify-center cursor-pointer"
            >
              Run Script
            </UButton>
          </div>
        </main>
      </template>
    </UTabs>
  </UApp>
</template>

<script lang="ts" setup>
import type { TabsItem } from "@nuxt/ui";
import { CodeDiff, CodeReader } from "v-code-diff";
import Converter from "./utils/converterr/converter";
import * as configs from "./utils/converterr/configs";
import type { IConvertBody } from "./server/api/convert.post";

const items = ref<TabsItem[]>([
  {
    label: "Content",
    icon: "material-symbols:content-paste-sharp",
    slot: "content",
  },
  {
    label: "Path",
    icon: "solar:folder-path-connect-broken",
    slot: "path",
  },
]);

const originalContent = ref("");
const convertedContent = ref("");

const configItems = ref(Object.keys(configs));

const converter = ref(new Converter());

const onClickConvert = () => {
  originalContent.value = converter.value.CONTENT;
  convertedContent.value = converter.value.convertContent();
};

const onClickConvertByPath = async () => {
  await $fetch("/api/convert", {
    method: "POST",
    body: {
      configs: converter.value.CONFIGS,
      pathInput: converter.value.PATH_INPUT,
      pathOutput: converter.value.PATH_OUTPUT,
      regex: converter.value.PATH_MATCH,
    } as IConvertBody,
  });
};

const toast = useToast();
const onClickCopy = async () => {
  await navigator.clipboard.writeText(convertedContent.value);
  toast.add({
    type: "background",
    color: "success",
    description: "Copy thành công",
  });
};

watch(
  () => converter.value.CONFIGS,
  () => {
    converter.value.init();
  }
);

const dataCookie = useCookie("data", {
  default: () =>
    ({
      CONFIGS: [],
      CONTENT: "",
      PATH_INPUT: "",
      PATH_OUTPUT: "",
      PATH_MATCH: "",
    } as any),
  watch: true,
});

onMounted(() => {
  converter.value.CONFIGS = dataCookie.value.CONFIGS;
  converter.value.CONTENT = dataCookie.value.CONTENT;
  converter.value.CONFIGS = dataCookie.value.CONFIGS;
  converter.value.PATH_INPUT = dataCookie.value.PATH_INPUT;
  converter.value.PATH_OUTPUT = dataCookie.value.PATH_OUTPUT;
  converter.value.PATH_MATCH = dataCookie.value.PATH_MATCH;
});

watch(
  converter,
  () => {
    dataCookie.value.CONFIGS = converter.value.CONFIGS;
    dataCookie.value.CONTENT = converter.value.CONTENT;
    dataCookie.value.CONFIGS = converter.value.CONFIGS;
    dataCookie.value.PATH_INPUT = converter.value.PATH_INPUT;
    dataCookie.value.PATH_OUTPUT = converter.value.PATH_OUTPUT;
    dataCookie.value.PATH_MATCH = converter.value.PATH_MATCH;
  },
  {
    deep: true,
  }
);
</script>
