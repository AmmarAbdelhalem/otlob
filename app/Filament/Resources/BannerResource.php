<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BannerResource\Pages;
use App\Models\Banner;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BannerResource extends Resource
{
    protected static ?string $model = Banner::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationGroup = 'Marketing & CMS';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'title_en';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Banner Content')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('title_en')
                                    ->label('Title (EN)'),
                                Forms\Components\TextInput::make('title_ar')
                                    ->label('العنوان (AR)')
                                    ->required(),
                                Forms\Components\TextInput::make('subtitle_en')
                                    ->label('Subtitle (EN)'),
                                Forms\Components\TextInput::make('subtitle_ar')
                                    ->label('العنوان الفرعي (AR)'),
                                Forms\Components\TextInput::make('badge_text')
                                    ->label('Badge / Ribbon Tag')
                                    ->placeholder('e.g. 20% OFF or LIMITED DEAL'),
                                Forms\Components\Select::make('position')
                                    ->options([
                                        'hero' => 'Top Hero Slider',
                                        'promo_strip' => 'Promotional Strip',
                                        'middle_banner' => 'Middle Section Banner',
                                    ])
                                    ->default('hero')
                                    ->required()
                                    ->native(false),
                            ]),

                        Forms\Components\FileUpload::make('image')
                            ->label('Banner Artwork')
                            ->image()
                            ->disk('public')
                            ->directory('banners')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Call To Action & Placement')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('cta_text_en')
                                    ->label('CTA Button (EN)')
                                    ->placeholder('Shop Now'),
                                Forms\Components\TextInput::make('cta_text_ar')
                                    ->label('زر الإجراء (AR)')
                                    ->placeholder('تسوق الآن'),
                                Forms\Components\TextInput::make('cta_url')
                                    ->label('Destination URL / Path')
                                    ->placeholder('/category/brakes'),
                            ]),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('sort_order')
                                    ->label('Display Order')
                                    ->numeric()
                                    ->default(0),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Active & Visible')
                                    ->default(true)
                                    ->required(),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Banner')
                    ->width(120)
                    ->height(60),
                Tables\Columns\TextColumn::make('title_ar')
                    ->label('العنوان')
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('title_en')
                    ->label('Title (EN)')
                    ->searchable(),
                Tables\Columns\TextColumn::make('position')
                    ->label('Position')
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBanners::route('/'),
            'create' => Pages\CreateBanner::route('/create'),
            'edit' => Pages\EditBanner::route('/{record}/edit'),
        ];
    }
}
