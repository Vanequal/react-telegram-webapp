import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, { Background, useNodesState, useEdgesState } from 'reactflow'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'

const initialRoot = {
  id: 'ЧЛ',
  data: { label: 'Чёрная Львинка' },
  position: { x: 500, y: 100 },
  style: { background: '#fdf1ff', padding: 10, borderRadius: 10, fontWeight: 'bold' },
  level: 1,
}

const childNodes = {
  ЧЛ: [
    { id: 'упр', data: { label: 'Управление популяцией' }, position: { x: 200, y: 250 }, level: 2 },
    { id: 'био', data: { label: 'Биореактор' }, position: { x: 500, y: 250 }, level: 2 },
    { id: 'инс', data: { label: 'Инсектарий' }, position: { x: 800, y: 250 }, level: 2 },
  ],
  упр: [
    { id: 'этап1', data: { label: '1 Этап "Яйцо ЧЛ"' }, position: { x: 0, y: 400 }, level: 3 },
    { id: 'этап2', data: { label: '2. Малёк личинки ЧЛ' }, position: { x: 150, y: 450 }, level: 3 },
    { id: 'этап3', data: { label: '3. Мини-личинка ЧЛ' }, position: { x: 300, y: 500 }, level: 3 },
    { id: 'этап4', data: { label: '4. Личинка ЧЛ' }, position: { x: 450, y: 550 }, level: 3 },
    { id: 'этап5', data: { label: '5. Предкуколка ЧЛ' }, position: { x: 600, y: 600 }, level: 3 },
    { id: 'этап6', data: { label: '6. Куколка ЧЛ' }, position: { x: 750, y: 650 }, level: 3 },
    { id: 'этап7', data: { label: '7. Имаго ЧЛ' }, position: { x: 900, y: 700 }, level: 3 },
  ],
  инс: [
    { id: 'блок1', data: { label: 'Блок 1 – Зона спаривания' }, position: { x: 650, y: 400 }, level: 3 },
    { id: 'блок2', data: { label: 'Блок 2 "Малёковый душ"' }, position: { x: 800, y: 450 }, level: 3 },
    { id: 'блок3', data: { label: 'Блок 3 Малёковый инкубатор' }, position: { x: 950, y: 500 }, level: 3 },
  ],
}

const GraphPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const navigate = useNavigate()

  useEffect(() => {
    const level1 = [initialRoot]
    const level2 = childNodes['ЧЛ'] || []
    const level3 = level2.flatMap(node => childNodes[node.id] || [])

    const allNodes = [...level1, ...level2, ...level3]

    const allEdges = [
      ...level2.map(child => ({ id: `ЧЛ->${child.id}`, source: 'ЧЛ', target: child.id })),
      ...level2.flatMap(parent =>
        (childNodes[parent.id] || []).map(child => ({
          id: `${parent.id}->${child.id}`,
          source: parent.id,
          target: child.id,
        }))
      ),
    ]

    // Добавим стили для среднего уровня
    const styledNodes = allNodes.map(n => {
      if (n.level === 2) {
        return { ...n, style: { background: '#d3f9d8', borderRadius: 10, padding: 10 } }
      }
      return n
    })

    setNodes(styledNodes)
    setEdges(allEdges)
  }, [])

  const onNodeClick = useCallback(
    (_, node) => {
      const nodeId = node.id

      if (node.level === 2) {
        // Средний ряд — перейти на карточку проекта
        navigate(`/project/${nodeId}`)
        return
      }

      const children = childNodes[nodeId] || []
      if (children.length === 0) {
        // нет потомков — выделить красным
        setNodes(nds => nds.map(n => (n.id === nodeId ? { ...n, style: { ...n.style, border: '2px solid red' } } : n)))
        return
      }

      // показать потомков (ещё 2 уровня ниже)
      const grandchildren = children.flatMap(n => childNodes[n.id] || [])
      const newEdges = [
        ...children.map(child => ({ id: `${nodeId}->${child.id}`, source: nodeId, target: child.id })),
        ...children.flatMap(parent =>
          (childNodes[parent.id] || []).map(child => ({
            id: `${parent.id}->${child.id}`,
            source: parent.id,
            target: child.id,
          }))
        ),
      ]

      setNodes(nds => {
        const existingIds = new Set(nds.map(n => n.id))
        const newNodes = [...children, ...grandchildren].filter(n => !existingIds.has(n.id))
        return [...nds, ...newNodes]
      })
      setEdges(eds => [...eds, ...newEdges])
    },
    [navigate]
  )

  return (
    <div style={{ height: '100vh', background: '#f5f6f7' }}>
      <MindVaultHeader onBackClick={() => navigate('/')} hideSectionTitle hideDescription title="Графическая Структура" textColor="black" bgColor="#EEEFF1" fontSize="18px" />
      <div style={{ height: 'calc(100vh - 60px)' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} fitView style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}>
          <Background gap={16} color="#bbb" />
        </ReactFlow>
      </div>
    </div>
  )
}

export default GraphPage
