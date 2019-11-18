const getAllParents = (element: HTMLElement): HTMLElement[] =>
  element.parentElement != null ? [element, ...getAllParents(element.parentElement)] : [element];
export const touchStart = (event: React.TouchEvent<HTMLDivElement>) => {
  if (event.nativeEvent.target) {
    getAllParents(event.nativeEvent.target as HTMLElement).forEach(elt =>
      elt.setAttribute('touched', 'true')
    );
  }
};
export const touchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
  if (event.nativeEvent.target) {
    getAllParents(event.nativeEvent.target as HTMLElement).forEach(elt =>
      elt.removeAttribute('touched')
    );
  }
};
