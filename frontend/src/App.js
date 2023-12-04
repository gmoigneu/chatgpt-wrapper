import './index.css';
import { useState, useEffect } from'react';
import {useAppStore} from "./lib/store";
import Chat from "./Chat";
import NoChat from "./NoChat";
import {
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import {PlusCircleIcon} from "@heroicons/react/20/solid";
import {postChat} from "./lib/api";


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const App = () => {

  const [fetchChats, chats, addChat] = useAppStore(state => [state.fetchChats, state.chats, state.addChat]);
  const [selectedChat, setSelectedChat] = useState(null)

  useEffect(() => {
    if (chats.length === 0) {
      fetchChats();
    }
  }, [])

  function createNewChat() {
    postChat().then(chat => {
      addChat(chat)
      setSelectedChat(chat)
    })
  }

  return (
    <div className="App">
      <div>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto pt-12 bg-gray-900 px-6">
            <nav className="flex flex-1 flex-col">
              <button
                  type="button"
                  onClick={() => createNewChat()}
                  className="-mx-2 space-y-1 mb-4 inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusCircleIcon className="h-5 w-5 mr-4 " aria-hidden="true" />
                Create a new chat
              </button>
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {chats.map((chat) => (
                      <li key={'chat_' + chat.id}
                            className={classNames(
                            selectedChat && chat.id === selectedChat.id
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                            onClick={() => setSelectedChat(chat)}>
                          <ChatBubbleLeftIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {chat.title}
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">
            {selectedChat && <Chat chat={selectedChat} />}
            {!selectedChat && <NoChat />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;




