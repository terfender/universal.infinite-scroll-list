import React, { useMemo, useRef, useEffect, useState, } from "react";
import { VirtuosoGrid, Virtuoso } from "react-virtuoso";
const DEFAULT_VIEWABILITY_THRESHOLD_PERCENTAGE = 80;
const renderComponent = (Component) => {
    if (!Component)
        return null;
    if (React.isValidElement(Component))
        return Component;
    return <Component />;
};
const ViewabilityTracker = ({ index, item, children, onViewableItemsChanged, viewableItems, itemVisiblePercentThreshold, }) => {
    const ref = useRef(null);
    useEffect(() => {
        let observer;
        // defer with a setTimeout. I think virtuoso might be mounting stuff async so intersection observer doesn't detect item on initial render
        setTimeout(() => {
            if (onViewableItemsChanged) {
                observer = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting) {
                        if (!viewableItems.current.find((v) => v.index === index))
                            viewableItems.current.push({
                                item,
                                index,
                                isViewable: true,
                                key: index.toString(),
                                timestamp: new Date().valueOf(),
                            });
                    }
                    else {
                        viewableItems.current = viewableItems.current.filter((v) => v.index !== index);
                    }
                    viewableItems.current = viewableItems.current.sort((a, b) => a.index && b.index ? a.index - b.index : -1);
                    onViewableItemsChanged?.({
                        viewableItems: viewableItems.current,
                        // TODO: implement changed
                        changed: [],
                    });
                }, {
                    // will trigger intersection callback when item is 70% visible
                    threshold: itemVisiblePercentThreshold / 100,
                });
                if (ref.current)
                    observer.observe(ref.current);
            }
        }, 10);
        return () => {
            observer?.disconnect();
        };
    }, [
        onViewableItemsChanged,
        viewableItems,
        index,
        item,
        itemVisiblePercentThreshold,
    ]);
    return <div ref={ref}>{children}</div>;
};
export function VirtuosoListComponent({ renderItem, data, onEndReached, ListHeaderComponent, ListFooterComponent, ItemSeparatorComponent, ListEmptyComponent, numColumns = 1, overscan, useWindowScroll = true, style, onViewableItemsChanged, gridItemProps = {}, viewabilityConfig, estimatedItemSize, }, ref) {
    const viewableItems = useRef([]);
    const [listItemHeight, setListItemHeight] = useState(0);
    const minHeight = useMemo(() => {
        if (listItemHeight) {
            return listItemHeight;
        }
        if (estimatedItemSize && data) {
            return (estimatedItemSize *
                (numColumns ? data.length / numColumns : data.length));
        }
        return 0;
    }, [data, estimatedItemSize, listItemHeight, numColumns]);
    const renderItemContent = React.useCallback((index) => {
        if (data && data[index]) {
            const element = renderItem?.({
                item: data[index],
                index,
                target: "Cell",
            });
            return (<ViewabilityTracker index={index} itemVisiblePercentThreshold={viewabilityConfig?.itemVisiblePercentThreshold ??
                    DEFAULT_VIEWABILITY_THRESHOLD_PERCENTAGE} item={data[index]} viewableItems={viewableItems} onViewableItemsChanged={onViewableItemsChanged}>
            {element}
            {index < data.length - 1 && renderComponent(ItemSeparatorComponent)}
          </ViewabilityTracker>);
        }
        return null;
    }, [
        data,
        ItemSeparatorComponent,
        renderItem,
        onViewableItemsChanged,
        viewabilityConfig?.itemVisiblePercentThreshold,
    ]);
    const renderListFooterComponent = React.useCallback(() => renderComponent(ListFooterComponent), [ListFooterComponent]);
    const components = useMemo(() => ({
        Header: ListHeaderComponent,
        Footer: renderListFooterComponent,
        EmptyPlaceholder: () => renderComponent(ListEmptyComponent),
    }), [ListEmptyComponent, ListHeaderComponent, renderListFooterComponent]);
    const gridComponents = useMemo(() => ({
        Item: (props) => (<ItemContainer {...props} numColumns={numColumns} ItemSeparatorComponent={ItemSeparatorComponent} {...gridItemProps}/>),
        List: ListContainer,
        Header: ListHeaderComponent,
        Footer: renderListFooterComponent,
    }), [
        ItemSeparatorComponent,
        ListHeaderComponent,
        gridItemProps,
        numColumns,
        renderListFooterComponent,
    ]);
    return (<div style={useWindowScroll ? { minHeight: `${minHeight}px` } : { height: "100%" }}>
      {numColumns === 1 ? (<Virtuoso useWindowScroll={useWindowScroll} data={data ?? []} defaultItemHeight={estimatedItemSize} endReached={onEndReached} itemContent={renderItemContent} components={components} overscan={overscan} style={style} totalListHeightChanged={setListItemHeight} ref={ref}/>) : (<VirtuosoGrid useWindowScroll={useWindowScroll} totalCount={data?.length || 0} components={gridComponents} endReached={onEndReached} itemContent={renderItemContent} overscan={overscan} style={style} ref={ref}/>)}
    </div>);
}
export const InfiniteScrollList = React.forwardRef(VirtuosoListComponent);
const ListContainer = React.forwardRef(function ListContainer(props, ref) {
    return (<div {...props} style={{ ...props.style, display: "flex", flexWrap: "wrap" }} ref={ref}/>);
});
const ItemContainer = React.forwardRef(function ItemContainer({ style, ...rest }, ref) {
    const width = rest.numColumns ? `${100 / rest.numColumns}%` : "100%";
    return (<div {...rest} style={{ ...style, width }} ref={ref}>
      {rest.children}
      {renderComponent(rest.ItemSeparatorComponent)}
    </div>);
});
//# sourceMappingURL=infinite-scroll-list.web.js.map