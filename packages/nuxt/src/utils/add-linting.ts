import {
  GeneratorCallback,
  addDependenciesToPackageJson,
  runTasksInSerial,
} from '@nx/devkit';
import { Linter, LinterType, lintProjectGenerator } from '@nx/eslint';
import {
  addExtendsToLintConfig,
  addIgnoresToLintConfig,
  isEslintConfigSupported,
} from '@nx/eslint/src/generators/utils/eslint-file';
import { editEslintConfigFiles } from '@nx/vue';
import { Tree } from 'nx/src/generators/tree';
import { joinPathFragments } from 'nx/src/utils/path';
import { nuxtEslintConfigVersion } from './versions';

export async function addLinting(
  host: Tree,
  options: {
    linter: Linter | LinterType;
    projectName: string;
    projectRoot: string;
    unitTestRunner?: 'vitest' | 'none';
    rootProject?: boolean;
  }
) {
  const tasks: GeneratorCallback[] = [];
  if (options.linter === 'eslint') {
    const lintTask = await lintProjectGenerator(host, {
      linter: options.linter,
      project: options.projectName,
      tsConfigPaths: [joinPathFragments(options.projectRoot, 'tsconfig.json')],
      unitTestRunner: options.unitTestRunner,
      skipFormat: true,
      rootProject: options.rootProject,
      addPlugin: true,
    });
    tasks.push(lintTask);

    editEslintConfigFiles(host, options.projectRoot);

    if (isEslintConfigSupported(host, options.projectRoot)) {
      const addExtendsTask = addExtendsToLintConfig(host, options.projectRoot, [
        '@nuxt/eslint-config',
      ]);
      tasks.push(addExtendsTask);
      addIgnoresToLintConfig(host, options.projectRoot, [
        '.nuxt/**',
        '.output/**',
        'node_modules',
      ]);
    }

    const installTask = addDependenciesToPackageJson(
      host,
      {},
      {
        '@nuxt/eslint-config': nuxtEslintConfigVersion,
      }
    );
    tasks.push(installTask);
  }
  return runTasksInSerial(...tasks);
}
