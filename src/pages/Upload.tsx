
import React from 'react';
import { DropZone } from '@/components/upload/DropZone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XmlUpload } from '@/components/upload/XmlUpload';

const Upload = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">העלאת קבצים</h1>
      
      <Tabs defaultValue="receipts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="receipts">קבלות</TabsTrigger>
          <TabsTrigger value="xml">קבצי XML</TabsTrigger>
        </TabsList>
        
        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>העלאת קבלות</CardTitle>
            </CardHeader>
            <CardContent>
              <DropZone />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="xml">
          <Card>
            <CardHeader>
              <CardTitle>העלאת קבצי XML</CardTitle>
            </CardHeader>
            <CardContent>
              <XmlUpload />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
