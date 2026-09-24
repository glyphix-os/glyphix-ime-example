import SysPrompt from '@system.prompt';

type PromptLike = {
  showToast(options: { message: string; duration?: number }): void;
  showPopup(options: { uri: string; params?: { [k: string]: unknown } }): void;
};

export const prompt = SysPrompt as PromptLike;
