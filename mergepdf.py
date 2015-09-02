#!/usr/bin/python
# -*- coding: utf-8 -*-

import PyPDF2 as pypdf
import sys
import getopt

# TOOLS: http://williamjturkel.net/2013/08/24/working-with-pdfs-using-command-line-tools-in-linux/
# yum install -y xpdf pdftk poppler-utils
# pdftotext a.pdf a.txt

# merge pdf from a water mark, to a page
# {int} p : page Number 1-based
# {string} inpath : input file path
# {string} imagepath : watermark file path
# {string} outpath : output file path

def mergePDFMark(inpath, imgpath, p, outpath):
    content = []
    inFile = open(inpath, "rb")
    p-=1
    # overlay = open(imgpath, "rb")
    with open(imgpath, "rb") as overlay:

        original = pypdf.PdfFileReader(inFile)
        foreground = pypdf.PdfFileReader(overlay).getPage(0)

        background = original.getPage(p)
        background.mergePage(foreground)

        # add all pages to a writer
        writer = pypdf.PdfFileWriter()
        for i in range(original.getNumPages()):
            page = original.getPage(i)
            writer.addPage(page)
            #content.append(page.extractText().encode('utf-8').replace("\xa0", " "))

        # write everything in the writer to a file
        with open(outpath, "wb") as outFile:
            writer.addMetadata({'/Producer': 'yumji'})
            writer.write(outFile)
        #print '\n'.join(content)
        # don't rely on pyPDF to get text, using xpdf command pdftotext instead.
        print "ok"


def mergePDF(inpath, imgpath, outpath):
    content = []
    inFile = open(inpath, "rb")

    # overlay = open(imgpath, "rb")
    with open(imgpath, "rb") as overlay:

        original = pypdf.PdfFileReader(inFile)
        image = pypdf.PdfFileReader(overlay)

        # add all pages to a writer
        writer = pypdf.PdfFileWriter()
        originalTotal = original.getNumPages()

        for i in range(original.getNumPages()):
            # if i>=originalTotal: break;

            background = original.getPage(i)

            try:
                foreground = image.getPage(i)
                background.mergePage(foreground)
            except IndexError:
                print 'index not exists in image', i

            # print i, foreground
            writer.addPage(background)
            #content.append(page.extractText().encode('utf-8').replace("\xa0", " "))

        # write everything in the writer to a file
        with open(outpath, "wb") as outFile:
            writer.addMetadata({'/Producer': 'yumji'})
            writer.write(outFile)
        #print '\n'.join(content)
        # don't rely on pyPDF to get text, using xpdf command pdftotext instead.
        print "ok"

def main(argv):
    inputfile = ''
    outputfile = ''
    markfile = ''
    page=1

    try:
        opts, args = getopt.getopt(argv,"hi:m:p:o:",["in=", "mark=", "page=", "out="])
    except getopt.GetoptError:
        print 'test.py -i <inputfile> -o <outputfile>'
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print sys.argv[0], ' -i <inputfile> -o <outputfile>'
            sys.exit()
        elif opt in ("-i", "--in"):
            inputfile = arg
        elif opt in ("-m", "--mark"):
            markfile = arg
        elif opt in ("-p", "--page"):
            page = int(arg)
        elif opt in ("-o", "--out"):
            outputfile = arg

    # print inputfile, markfile, outputfile
    if inputfile and markfile and outputfile:
        mergePDF(inputfile, markfile, outputfile)
    else:
        print "arguments error."

if __name__ == "__main__":
    main(sys.argv[1:])


