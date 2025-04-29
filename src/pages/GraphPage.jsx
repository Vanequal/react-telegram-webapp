import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'react-flow-renderer';

import MindVaultHeader from '../components/UI/MindVaultHeader';

const initialNodes = [
  {
    id: 'ЧЛ',
    data: { label: 'Чёрная Львинка' },
    position: { x: 500, y: 100 },
    style: { background: '#fdf1ff', padding: 10, borderRadius: 10, fontWeight: 'bold' }
  }
];

const initialEdges = [];

const childNodes = {
  'ЧЛ': [
    {
      id: 'упр',
      data: { label: 'Управление популяцией' },
      position: { x: 200, y: 250 },
    },
    {
      id: 'био',
      data: { label: 'Биореактор' },
      position: { x: 500, y: 250 },
    },
    {
      id: 'инс',
      data: { label: 'Инсектарий' },
      position: { x: 800, y: 250 },
    }
  ],
  'упр': [
    { id: 'этап1', data: { label: '1 Этап "Яйцо ЧЛ"' }, position: { x: 0, y: 400 } },
    { id: 'этап2', data: { label: '2. Малёк личинки ЧЛ' }, position: { x: 150, y: 450 } },
    { id: 'этап3', data: { label: '3. Мини-личинка ЧЛ' }, position: { x: 300, y: 500 } },
    { id: 'этап4', data: { label: '4. Личинка ЧЛ' }, position: { x: 450, y: 550 } },
    { id: 'этап5', data: { label: '5. Предкуколка ЧЛ' }, position: { x: 600, y: 600 } },
    { id: 'этап6', data: { label: '6. Куколка ЧЛ' }, position: { x: 750, y: 650 } },
    { id: 'этап7', data: { label: '7. Имаго ЧЛ' }, position: { x: 900, y: 700 } }
  ],
  'инс': [
    { id: 'блок1', data: { label: 'Блок 1 – Зона спаривания' }, position: { x: 650, y: 400 } },
    { id: 'блок2', data: { label: 'Блок 2 "Малёковый душ"' }, position: { x: 800, y: 450 } },
    { id: 'блок3', data: { label: 'Блок 3 Малёковый инкубатор' }, position: { x: 950, y: 500 } }
  ]
};

const GraphPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [expandedNodes, setExpandedNodes] = useState([]);

  const onNodeClick = useCallback((_, node) => {
    const nodeId = node.id;
    if (expandedNodes.includes(nodeId)) return;

    const newChildren = childNodes[nodeId] || [];

    const newEdges = newChildren.map((child) => ({
      id: `${nodeId}->${child.id}`,
      source: nodeId,
      target: child.id,
    }));

    setNodes((nds) => [...nds, ...newChildren]);
    setEdges((eds) => [...eds, ...newEdges]);
    setExpandedNodes((prev) => [...prev, nodeId]);
  }, [expandedNodes]);

  const navigate = useNavigate()
  return (
    <div style={{ height: '100vh', background: '#f5f6f7' }}>
      <MindVaultHeader
        onBackClick={() => navigate('/')}
        hideSectionTitle
        hideDescription
        title="Графическая Структура"
        textColor="black"
        bgColor="#EEEFF1"
        fontSize="18px"
      />
      <div style={{ height: 'calc(100vh - 60px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}
        >
          <Background gap={16} color="#bbb" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default GraphPage;
