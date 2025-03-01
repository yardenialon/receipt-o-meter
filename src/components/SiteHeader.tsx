
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MobileNav } from './sidebar/MobileNav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">סלל</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            עזרה
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback>יו</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
