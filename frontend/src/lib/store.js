import { devtools } from 'zustand/middleware'
import { createWithEqualityFn } from 'zustand/traditional'
import {getChats} from "./api";

export const useAppStore = createWithEqualityFn(
    devtools(set => ({
        chats: [],

        fetchChats: async () => {
            const response = await getChats()
            set({ chats: await response })
        },

        addChat: async (chat) => {
            set(state => ({
                chats: [...state.chats, chat],
            }))
        }
    })
))
