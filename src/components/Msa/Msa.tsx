/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef } from 'react'

import { GeneCluster, SpeciesDesc, useGeneClusterData } from 'src/hooks/useDataIndexQuery'

// @ts-ignore
import msa from 'src/components/Msa/msa/src/msa'

// import { panXTree, msaViewerAsset } from '../Tree/global'
// import {hideNonSelected} from './tree-init'
// import {button_tooltip,append_download_button} from './tooltips'

export interface MsaProps {
  species: SpeciesDesc
  gene: GeneCluster
  seqType: string
}

export default function Msa({ species, gene, seqType }: MsaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { aa_aln_reduced, na_aln_reduced } = useGeneClusterData(species, gene)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const fasta = seqType === 'aa' ? aa_aln_reduced : na_aln_reduced
    if (!fasta) {
      return
    }

    msaLoad(ref.current, seqType, fasta)
  }, [aa_aln_reduced, na_aln_reduced, seqType, species.id])

  return <div ref={ref} />
}

function msaLoad(rootDiv: HTMLDivElement, seqType: string, fasta: string) {
  // eslint-disable-next-line new-cap
  const m = new msa({
    el: rootDiv,
    importFasta: fasta,
    bootstrapMenu: false,
    vis: { scaleslider: true, conserv: false, overviewbox: false, labelId: false },
    zoomer: { labelFontsize: '12', residueFont: '12' },
    /* zoomer: {
      alignmentWidth:'auto',alignmentHeight: 250,rowHeight: 18,
      labelWidth: 100, labelNameLength: 150,
      labelNameFontsize: '10px',labelIdLength: 20, menuFontsize: '12px',
      menuMarginLeft: '3px', menuPadding: '3px 4px 3px 4px', menuItemFontsize: '14px', menuItemLineHeight: '14px',
      boxRectHeight: 2, boxRectWidth: 0.1, overviewboxPaddingTop: 20
    };*/
    colorscheme: { scheme: seqType === 'aa' ? 'taylor' : 'nucleotide' },
  })

  // //# click row/rows to highlight the related strain/strains
  // const seqID_to_accession_dt = {}
  // m.g.on('row:click', (data) => {
  //   const alnID = data.evt.currentTarget.textContent
  //   const accession = alnID.split('-', 1)[0]
  //   seqID_to_accession_dt[data.seqId] = accession
  //   msaViewerAsset.selected_rows_set = new Set()
  //   const selection = m.g.selcol.pluck('seqId')
  //   for (let i = 0, len = selection.length; i < len; i++) {
  //     msaViewerAsset.selected_rows_set.add(seqID_to_accession_dt[selection[i]])
  //   }
  //   // var speciesTree = panXTree.speciesTree
  //   //
  //   // if (speciesTree) {
  //   //   speciesTree.tips.forEach(function (d) {
  //   //     d.state.selected = false
  //   //   })
  //   //   msaViewerAsset.selected_rows_set.forEach(function (accession) {
  //   //     if (speciesTree.namesToTips[accession]) {
  //   //       speciesTree.namesToTips[accession].state.selected = true
  //   //     } else {
  //   //       console.log('accession not found', accession)
  //   //     }
  //   //   })
  //   // } else {
  //   //   console.log('speciesTree not available')
  //   // }
  //   // hideNonSelected(speciesTree)
  // })
  //
  // const scaleSize = seqType === 'nuc' ? 2 : 3
  // m.g.scale.setSize(scaleSize)

  // const msa_legend = d3.select('#msa_legend')
  // msa_legend.selectAll('a, span').remove()
  // append_download_button('#msa_legend', 'msa_aln', aln_path.replace('_reduced', ''))
  // append_download_button('#msa_legend', 'msa_reduced_aln', aln_path)
  // const msa_button_tooltip_dict = {
  //   msa_aln: 'download current alignment',
  //   msa_reduced_aln: 'download current reduced alignment (consensus sequence and variable sites)',
  // }
  // button_tooltip('#msa_legend', msa_button_tooltip_dict)

  m.render()
}
