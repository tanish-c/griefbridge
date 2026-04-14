import { useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';

const NODE_COLORS = {
  NOT_STARTED: '#94A3B8', UNLOCKED: '#DBEAFE',
  IN_PROGRESS: '#3B82F6', BLOCKED: '#FED7AA',
  COMPLETED: '#22C55E', OVERDUE: '#EF4444'
};

const STROKE_COLORS = {
  NOT_STARTED: '#CBD5E1', UNLOCKED: '#3B82F6',
  IN_PROGRESS: '#1D4ED8', BLOCKED: '#F97316',
  COMPLETED: '#16A34A', OVERDUE: '#DC2626'
};

export function useGraph(containerRef, nodes, edges, onNodeClick, onNodeComplete) {
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !nodes || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom().on('zoom', (e) => g.attr('transform', e.transform)));

    const g = svg.append('g');

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#94A3B8');

    const nodesCopy = nodes.map(n => ({ ...n }));
    const edgesCopy = edges.map(e => ({
      source: e.source,
      target: e.target,
      completed: e.completed
    }));

    simulationRef.current = d3.forceSimulation(nodesCopy)
      .force('link', d3.forceLink(edgesCopy).id(d => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const link = g.append('g').selectAll('path')
      .data(edgesCopy)
      .join('path')
      .attr('stroke', d => d.completed ? '#22C55E' : '#CBD5E1')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('stroke-dasharray', d => d.completed ? 'none' : '8,4')
      .attr('marker-end', 'url(#arrowhead)');

    const node = g.append('g').selectAll('g')
      .data(nodesCopy)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick(d))
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) simulationRef.current.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulationRef.current.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append('circle')
      .attr('r', 32)
      .attr('fill', d => NODE_COLORS[d.status] || '#94A3B8')
      .attr('stroke', d => STROKE_COLORS[d.status] || '#CBD5E1')
      .attr('stroke-width', d => ['IN_PROGRESS', 'OVERDUE'].includes(d.status) ? 3 : 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 50)
      .attr('font-size', '11px')
      .attr('fill', '#374151')
      .text(d => d.title.length > 18 ? d.title.substring(0, 15) + '...' : d.title);

    container.querySelectorAll('circle').forEach((el, i) => {
      if (nodesCopy[i]?.status === 'UNLOCKED') {
        gsap.to(el, { attr: { r: 36 }, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }
      if (nodesCopy[i]?.status === 'OVERDUE') {
        gsap.to(el, { attr: { r: 35 }, duration: 0.8, yoyo: true, repeat: -1, ease: 'power2.inOut' });
      }
    });

    simulationRef.current.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x, dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulationRef.current?.stop();
      d3.select(container).selectAll('*').remove();
    };
  }, [nodes, edges, onNodeClick]);
}
