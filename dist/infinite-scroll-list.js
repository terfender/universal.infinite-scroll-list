import React, { useCallback } from "react";
import { View } from "react-native";
import { FlashList, } from "@shopify/flash-list";
function FlashListComponent({ style, renderItem: propRenderItem, numColumns, gridItemProps, ...rest }, ref) {
    const renderItem = useCallback((props) => {
        if (!propRenderItem)
            return null;
        if (gridItemProps && numColumns && numColumns > 1) {
            return <View {...gridItemProps}>{propRenderItem(props)}</View>;
        }
        else {
            return propRenderItem(props);
        }
    }, [gridItemProps, numColumns, propRenderItem]);
    if (style) {
        return (<View style={[{ height: "100%" }, style]}>
        <FlashList {...rest} numColumns={numColumns} ref={ref} renderItem={renderItem}/>
      </View>);
    }
    else {
        return (<FlashList {...rest} numColumns={numColumns} renderItem={renderItem} ref={ref}/>);
    }
}
export const InfiniteScrollList = React.forwardRef(FlashListComponent);
//# sourceMappingURL=infinite-scroll-list.js.map