import {create} from "zustand";
import {persist} from "zustand/middleware";
import {StoreKey} from "@/server/common/constant";

export interface DataType {
    gender?: string;
    name: {
        title?: string;
        first?: string;
        last?: string;
    };
    email?: string;
    picture: {
        large?: string;
        medium?: string;
        thumbnail?: string;
    };
    nat?: string;
    loading: boolean;
}


export interface LockerControlStore {
    code: string;

    list: DataType[];

    updateCode: (_: string) => void;
    addList: (_: DataType[]) => void;
    clearList: () => void;

}


export const useLockerStore = create<LockerControlStore>()(
    persist(
        (set, get) => ({
            code: "",
            list: [],
            updateCode(code: string) {
                set(() => ({code: code?.trim()}));
            },
            addList(data: DataType[]) {
                set(() => ({list: [...(get().list), ...data]}));
            },
            clearList() {
                set(() => ({list: []}));
            },
        }),
        {
            name: StoreKey.Locker,
            version: 1,
        },
    ),
);
