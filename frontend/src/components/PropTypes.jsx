import PropTypes from 'prop-types';

// PropTypes for all components
export const chatPropTypes = {
  username: PropTypes.string.isRequired,
  roomCode: PropTypes.string.isRequired,
  onLeave: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export const joinPropTypes = {
  onJoin: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  toggleDarkMode: PropTypes.func,
};

export const headerPropTypes = {
  roomCode: PropTypes.string.isRequired,
  userCount: PropTypes.number.isRequired,
  onLeave: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export const messageBubblePropTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    timestamp: PropTypes.number.isRequired,
    reactions: PropTypes.object,
    isSystem: PropTypes.bool,
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool.isRequired,
  onReaction: PropTypes.func,
};

export const messageInputPropTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
};

export const typingIndicatorPropTypes = {
  username: PropTypes.string.isRequired,
};

export const codeBlockPropTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string,
  darkMode: PropTypes.bool,
};
