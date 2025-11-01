import { StyleSheet, Dimensions } from 'react-native';


export const markdownStyles = StyleSheet.create({
  body: {
    color: '#000',
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#ffcc00',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#ffcc66',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#ffcc99',
  },
  paragraph: {
    marginVertical: 4,
  },
  strong: {
    fontWeight: 'bold',
    color: '#ffd700',
  },
  em: {
    fontStyle: 'italic',
    color: '#aaa',
  },
  blockquote: {
    backgroundColor: '#222',
    borderLeftWidth: 4,
    borderLeftColor: '#888',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  code_block: {
    fontFamily: 'Courier',
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 6,
    color: '#0f0',
  },
  code_inline: {
    fontFamily: 'Courier',
    backgroundColor: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#0f0',
  },
  list_item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  link: {
    color: '#64c4ff',
    textDecorationLine: 'underline',
  },
  table: {
    borderWidth: 1,
    borderColor: '#444',
  },
  thead: {
    backgroundColor: '#333',
  },
  th: {
    width: 150,
    padding: 6,
    borderWidth: 1,
    borderColor: '#555',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    overflow: 'hidden',
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: '#444',
  },
  td: {
    width: 150,
    padding: 6,
    borderWidth: 1,
    borderColor: '#555',
    color: '#ccc',
    textAlign: 'center',
    //flexWrap: 'wrap',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
});
