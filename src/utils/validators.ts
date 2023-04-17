export const getRequiredRule = (message: string) => {
  return {
    required: true,
    message,
    trigger: 'blur',
  };
};

export const getRequiredRuleByChange = (message: string) => {
  return {
    required: true,
    message,
    trigger: 'change',
  };
};

export const getArrayRequiredRule = (message: string) => {
  return {
    required: true,
    validator: (rule: any, val: any[], callback: (...args: any) => void) => {
      if (val.length === 0) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    message,
    trigger: 'change',
  };
};

export const getPatternCheckRule = (pattern: RegExp, message: string) => {
  return {
    pattern,
    message,
  };
};

export const getMinMaxCheckRule = (
  { min, max }: { min: number; max: number },
  message: string
) => {
  return {
    min,
    max,
    message,
  };
};
