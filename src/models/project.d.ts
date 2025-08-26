export type TreeNode = {
    name: string;
    type: "folder" | "file";
    children?: TreeNode[];
};
