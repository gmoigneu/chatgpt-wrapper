import { useState, useEffect } from'react';
import {useAppStore} from "./lib/store";
import {getMessages} from "./lib/api";

const NoChat = (props) => {
  return (
    <div className="NoChat">
      <p>Select a chat or create one.</p>
    </div>
  );
}

export default NoChat;
