List<T> allNodes = importedData;
List<T> nodesModel = new List<T>();
int nestingLevel = 0;
foreach (var node in allNodes)
{
	nodesModel = buildTree(nodesModel, node, ref nestingLevel);
}


List<T> buildTree(List<T> nodeContainer, T node, ref int nestingLevel)
{
	nestingLevel++;
	char separator = '/';
	string[] relatio = node.Hierarchy.Split(separator);
	string[] currRelatioArr = relatio.Skip(0).Take(nestingLevel).ToArray();
	string currRelatio = string.Join(separator.ToString(), currRelatioArr);
	//string[] nextRelatio = relatio.Skip(nestingLevel).ToArray(); 
	bool hasnextRelatio = nestingLevel + 1 <= relatio.Length;
	int containsNodeIndex = nodeContainer.FindIndex(item => item.Hierarchy == currRelatio);

	if (containsNodeIndex != -1)
	{
		if (hasnextRelatio)
		{
			nodeContainer[containsNodeIndex].ChildNodes = buildTree(nodeContainer[containsNodeIndex].ChildNodes, node, ref nestingLevel);
		}
		else
		{
			node.ChildNodes = nodeContainer[containsNodeIndex].ChildNodes;
			nodeContainer[containsNodeIndex] = node;
		}
	}
	else
	{
		if (hasnextRelatio)
		{
			T newNode = new T();
			newNode.ChildNodes = buildTree(newNode.ChildNodes, node, ref nestingLevel);
			nodeContainer.Add(newNode);
		}
		else
		{
			nodeContainer.Add(node);
		}
	}
	nestingLevel--;
	return nodeContainer;
}
