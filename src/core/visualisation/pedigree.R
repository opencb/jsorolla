require(kinship2)
pedAll <- pedigree(id = sample.ped$id, dadid = sample.ped$father, momid = sample.ped$mother, 
                   sex = sample.ped$sex, famid = sample.ped$ped)
print(pedAll)

DATA = pedAll[2]
WIDTH = 10 # min width

# TABLEDATA = align.pedigree(pedAll[2], packed=FALSE, width=10, align=TRUE, hints=pedAll$hints)$pos
write.table(align.pedigree(DATA, packed=FALSE, width=WIDTH, align=TRUE, hints=pedAll$hints)$n,
            file = "tab_n.csv",
            sep = "\t",
            row.names = TRUE,
            col.names = NA)

write.table(align.pedigree(DATA, packed=FALSE, width=WIDTH, align=TRUE, hints=pedAll$hints)$nid,
            file = "tab_nid.csv",
            sep = "\t",
            row.names = TRUE,
            col.names = NA)

write.table(align.pedigree(DATA, packed=FALSE, width=WIDTH, align=TRUE, hints=pedAll$hints)$pos,
            file = "tab_pos.csv",
            sep = "\t",
            row.names = TRUE,
            col.names = NA)

write.table(align.pedigree(DATA, packed=FALSE, width=WIDTH, align=TRUE, hints=pedAll$hints)$fam,
            file = "tab_fam.csv",
            sep = "\t",
            row.names = TRUE,
            col.names = NA)

write.table(align.pedigree(DATA, packed=FALSE, width=WIDTH, align=TRUE, hints=pedAll$hints)$spouse,
            file = "tab_spouse.csv",
            sep = "\t",
            row.names = TRUE,
            col.names = NA)

plot(DATA, packed = TRUE,width = 100)

