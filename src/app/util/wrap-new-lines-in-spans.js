import vdom_to_html from 'vdom-to-html';
import { VNode, VText } from 'virtual-dom';

const copy_node = (node, state) => {
  if (node.text) {
    return new VText(node.text);
  } else {
    return new VNode(node.tagName, node.properties, []);
  }
}

const get_parent = (state) => {
  return state.stack.slice(-1)[0];
}

const copy_stack = (state) => {
  let new_stack = [];
  for (let n = 0; n < state.stack.length; ++n) {
    const parent = new_stack.slice(-1)[0];
    const new_node = copy_node(state.stack[n], state);
    if (parent) {
      parent.children.push(new_node);
    }
    new_stack.push(new_node);
  }

  return new_stack;
}

const noop = () => {}

const get_default_state = () => ({
  stack: [new VNode('span', null, [])],
  log: [],
  output: [],
});

const wrap_new_lines_in_spans = function(nodes, cb=noop, state=get_default_state()) {
  nodes.forEach(function (node) {
    if (node.text) {
      if (node.text.indexOf('\n') > -1) {
        const lines = node.text.split('\n');
        get_parent(state).children.push(new VText(lines.shift()));

        for (let text of lines) {
          state.output.push(vdom_to_html(state.stack[0]));
          if (state.output.length > 1) {
            cb(null, state.output[state.output.length - 2]);
          }
          state.stack = copy_stack(state);
          get_parent(state).children.push(new VText(text));
        }
      } else {
        get_parent(state).children.push(new VText(node.text));
      }
    } else {
      const new_node = copy_node(node, state);
      get_parent(state).children.push(new_node);
      state.stack.push(new_node);
      wrap_new_lines_in_spans(node.children, cb, state);
      state.stack.pop();
    }
  });

  // pop the last element in the stack
  if (state.stack.length === 1) {
    state.output.push(vdom_to_html(state.stack[0]));
  }

  return state;
}

export default wrap_new_lines_in_spans;
