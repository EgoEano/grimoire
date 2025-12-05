import type { RouteNode } from '../types/types';

/**
 * Generates a unique mobile screen name for a route node.
 * Handles empty paths by creating unique identifiers based on hierarchy.
 * 
 * @param node - The route node
 * @param parentPath - The accumulated parent path (for hierarchy tracking)
 * @param index - The index of this node among siblings
 * @returns A unique screen name for mobile navigation
 */
export function generateMobileName(
    node: RouteNode,
    parentPath: string = '',
    index: number = 0
): string {
    // If explicitly set, use it
    if (node.mobileName) {
        return node.mobileName;
    }

    // If path is empty, generate a unique name
    if (node.path === '') {
        // Root level
        if (parentPath === '') {
            return '_root';
        }

        // Nested empty path - use parent path + index
        const cleanParentPath = parentPath.replace(/\//g, '_').replace(/^_/, '');
        return `_${cleanParentPath}_index${index > 0 ? index : ''}`;
    }

    // Normal path - use as-is (removing leading slash if present)
    return node.path.replace(/^\//, '');
}

/**
 * Normalizes a route tree for mobile navigation by assigning unique screen names.
 * This allows using empty paths for web while ensuring unique names for mobile.
 * 
 * @param node - The root route node
 * @param parentPath - Internal: accumulated parent path
 * @returns A new route tree with mobileName assigned to all nodes
 */
export function normalizeMobileRoutes(
    node: RouteNode,
    parentPath: string = ''
): RouteNode {
    const mobileName = generateMobileName(node, parentPath, 0);

    // Build the current full path for children
    const currentPath = parentPath
        ? `${parentPath}/${node.path}`.replace(/\/+/g, '/')
        : node.path;

    // Process children if they exist
    const children = node.children?.map((child, index) =>
        normalizeMobileRoutes(
            child,
            currentPath || '_' // If current path is empty, use '_' as parent identifier
        )
    );

    return {
        ...node,
        mobileName,
        children
    };
}

/**
 * Gets the mobile screen name for a route node.
 * Returns mobileName if set, otherwise returns the path.
 * 
 * @param node - The route node
 * @returns The screen name to use for mobile navigation
 */
export function getMobileScreenName(node: RouteNode): string {
    return node.mobileName || node.path || '_unnamed';
}
