/**
 * 动态滚到指定dom
 * @param dom
 */
export const scrollTo = (dom?: Element) => {
  dom?.scrollIntoView?.({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest',
  });
};
