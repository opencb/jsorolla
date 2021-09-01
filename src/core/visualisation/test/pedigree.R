require(kinship2)

family1_raw = read.csv("~/opencb/iva/lib/jsorolla/src/core/visualisation/test/resources/family1.csv")
pedAll <- pedigree(id = family1_raw$id, dadid = family1_raw$fatherid, momid = family1_raw$motherid, sex = family1_raw$sex)
DATA = pedAll


#pedAll <- pedigree(id = sample.ped$id, dadid = sample.ped$father, momid = sample.ped$mother, sex = sample.ped$sex, famid = sample.ped$ped)
#pedAll <- pedigree(id = minnbreast$id, dadid = minnbreast$fatherid, momid = minnbreast$motherid, sex = minnbreast$sex, famid = minnbreast$famid)
#DATA = pedAll[2]

write.table(DATA,
            file = "tab_data.csv",
            sep = "\t",
            row.names = TRUE,
            col.names = NA)
print(pedAll)

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

plot(DATA, packed = TRUE)

